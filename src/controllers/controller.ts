import { prisma } from "../services/prisma.js";
import type { Request, Response } from "express";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import { RiskLevel } from "../../generated/prisma/enums.js";

const ALLOWED_STATUSES = ["New", "In Review", "Needs Info", "Completed"];

// Helper to map incoming API status (with spaces) to Database Enum (without spaces)
const mapApiToDbStatus = (status: string): string => {
    const mapping: Record<string, string> = {
        "New": "New",
        "In Review": "InReview",
        "Needs Info": "NeedsInfo",
        "Completed": "Completed"
    };
    return mapping[status] || status;
};

// Helper to map Database Enum back to API format when responding to the client
const mapDbToApiStatus = (status: string): string => {
    const mapping: Record<string, string> = {
        "New": "New",
        "InReview": "In Review",
        "NeedsInfo": "Needs Info",
        "Completed": "Completed"
    };
    return mapping[status] || status;
};

const getAllQuotes = async (req: Request, res: Response) => {
    try {
        const allQuotes = await prisma.quoteRequest.findMany({
            include: { analysis: true }
        });

        const mappedQuotes = allQuotes.map(q => ({
            ...q,
            status: mapDbToApiStatus(q.status)
        }));

        res.json(new apiResponse(200, { allQuotes: mappedQuotes }));
    } catch (error: any) {
        throw new apiError(500, "Database failure: Failed to fetch quotes");
    }
};

const getQuote = async (req: Request, res: Response) => {
    try {
        const idString = req.params.id;
        if (!idString || typeof idString !== "string") {
            throw new apiError(400, "Invalid ID parameter");
        }
        const id = parseInt(idString, 10);

        if (isNaN(id)) {
            throw new apiError(400, "Invalid ID format");
        }

        const quote = await prisma.quoteRequest.findUnique({
            where: { id },
            include: { analysis: true }
        });

        if (!quote) {
            throw new apiError(404, `Quote with id ${id} not found`);
        }

        const mappedQuote = {
            ...quote,
            status: mapDbToApiStatus(quote.status)
        };

        res.json(new apiResponse(200, { quote: mappedQuote }));
    } catch (error: any) {
        if (error instanceof apiError) throw error;
        throw new apiError(500, "Database failure: Failed to retrieve quote");
    }
};

const newQuote = async (req: Request, res: Response) => {
    const { customer, project, status, estimatedValue } = req.body;

    // 1. Missing fields validation
    if (!customer || !project || !status || estimatedValue === undefined) {
        throw new apiError(400, "Missing required fields");
    }

    // 2. Type and empty string validation
    if (typeof customer !== "string" || customer.trim() === "") {
        throw new apiError(400, "Customer name must be a non-empty string");
    }
    if (typeof project !== "string" || project.trim() === "") {
        throw new apiError(400, "Project name must be a non-empty string");
    }

    // 3. Negative estimated value validation
    const parsedValue = Number(estimatedValue);
    if (isNaN(parsedValue) || parsedValue <= 0) {
        throw new apiError(400, "Estimated value must be a positive number");
    }

    // 4. Invalid status validation
    if (!ALLOWED_STATUSES.includes(status)) {
        throw new apiError(400, `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(", ")}`);
    }

    try {
        const quote = await prisma.quoteRequest.create({
            data: {
                customer: customer.trim(),
                project: project.trim(),
                status: mapApiToDbStatus(status) as any,
                estimated_value: parsedValue,
            },
        });

        const mappedQuote = {
            ...quote,
            status: mapDbToApiStatus(quote.status)
        };

        res.json(new apiResponse(201, { quote: mappedQuote }, "Quote created successfully"));
    } catch (error: any) {
        throw new apiError(500, "Database failure: Failed to create quote");
    }
};

const analyzeQuote = async (req: Request, res: Response) => {
    let id: number;
    try {
        const idString = req.params.id;
        if (!idString || typeof idString !== "string") {
            throw new apiError(400, "Invalid ID parameter");
        }
        id = parseInt(idString, 10);

        if (isNaN(id)) {
            throw new apiError(400, "Invalid ID format");
        }
    } catch (error) {
        if (error instanceof apiError) throw error;
        throw new apiError(400, "Invalid request format");
    }

    // 1. Find quote
    let quote;
    try {
        quote = await prisma.quoteRequest.findUnique({ where: { id } });
    } catch (dbErr) {
        throw new apiError(500, "Database failure: Failed to query quote");
    }

    if (!quote) {
        throw new apiError(404, `Quote with id ${id} not found`);
    }

    // 2. Call FastAPI
    let fastApiResponse;
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`${fastApiUrl}/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                quote_id: `Q${id}`
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`FastAPI returned status ${response.status}`);
        }

        fastApiResponse = await response.json();
    } catch (fetchErr: any) {
        throw new apiError(502, `FastAPI service is unavailable: ${fetchErr?.message || fetchErr}`);
    }

    // Validate FastAPI JSON response shape
    if (
        !fastApiResponse ||
        typeof fastApiResponse.risk !== "string" ||
        typeof fastApiResponse.confidence !== "number" ||
        !Array.isArray(fastApiResponse.missing_items)
    ) {
        throw new apiError(502, "FastAPI returned an invalid or malformed response");
    }

    // 3. Save analysis report
    try {
        const report = await prisma.analysisResult.upsert({
            where: { quote_id: id },
            update: {
                risk: fastApiResponse.risk as any,
                confidence: fastApiResponse.confidence,
                missing_items: fastApiResponse.missing_items,
            },
            create: {
                quote_id: id,
                risk: fastApiResponse.risk as any,
                confidence: fastApiResponse.confidence,
                missing_items: fastApiResponse.missing_items,
            }
        });

        const mappedQuote = {
            ...quote,
            status: mapDbToApiStatus(quote.status)
        };

        res.json(new apiResponse(200, { quote: mappedQuote, report }, "Quote analysis completed successfully"));
    } catch (dbErr) {
        throw new apiError(500, "Database failure: Failed to save analysis report");
    }
};

const updateQuoteStatus = async (req: Request, res: Response) => {
    const idString = req.params.id;
    if (!idString || typeof idString !== "string") {
        throw new apiError(400, "Invalid ID parameter");
    }
    const id = parseInt(idString, 10);
    if (isNaN(id)) {
        throw new apiError(400, "Invalid ID format");
    }

    const { status } = req.body;
    if (!status) {
        throw new apiError(400, "Missing status parameter");
    }

    if (!ALLOWED_STATUSES.includes(status)) {
        throw new apiError(400, `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(", ")}`);
    }

    // Find quote first
    let quote;
    try {
        quote = await prisma.quoteRequest.findUnique({ where: { id } });
    } catch (error) {
        throw new apiError(500, "Database failure: Failed to check quote existence");
    }

    if (!quote) {
        throw new apiError(404, `Quote with id ${id} not found`);
    }

    try {
        const updatedQuote = await prisma.quoteRequest.update({
            where: { id },
            data: {
                status: mapApiToDbStatus(status) as any
            }
        });

        const mappedQuote = {
            ...updatedQuote,
            status: mapDbToApiStatus(updatedQuote.status)
        };

        res.json(new apiResponse(200, { quote: mappedQuote }, "Quote status updated successfully"));
    } catch (error) {
        throw new apiError(500, "Database failure: Failed to update quote status");
    }
};

export { getAllQuotes, getQuote, newQuote, analyzeQuote, updateQuoteStatus };