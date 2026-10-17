
type TransactionType = "income" | "expense";

export function parsePositiveBigInt(value: unknown): bigint | null {
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
        return null;
    }

    try {
        return BigInt(value);
    } catch {
        return null;
    }
}

export function isTransactionType(value: unknown): value is TransactionType {
    return value === "income" || value === "expense";
}

export function normalizeName(
    value: unknown,
    maxLength: number
): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const name = value.trim();

    if (!name || name.length > maxLength) {
        return null;
    }

    return name;
}

export function parseAmount(value: unknown): string | null {
    if (typeof value !== "string" && typeof value !== "number") {
        return null;
    }

    const amount = String(value).trim();

    if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(amount)) {
        return null;
    }

    const [whole, fraction = ""] = amount.split(".");
    const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));

    if (cents <= 0n) {
        return null;
    }

    return `${BigInt(whole).toString()}.${fraction.padEnd(2, "0")}`;
}

export function parseDateOnly(value: unknown): Date | null {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return null;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
    ) {
        return null;
    }

    return date;
}

export function isPrismaErrorCode(
    error: unknown,
    code: string
): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === code
    );
}

export class CategoryTypeMismatchError extends Error {}
export class CategoryLimitRequiredError extends Error {}
export class CategoryLimitOnlyForNewCategoryError extends Error {}
export class CategoryLimitNotAllowedForIncomeError extends Error {}
export class TransactionNotFoundError extends Error {}
export class CategoryRequiredForTypeChangeError extends Error {}
export class CategoryNotFoundError extends Error {}
export class CategoryAlreadyExistsError extends Error {}
export class CategoryInUseError extends Error {}
export class CategoryLimitNotAllowedError extends Error {}
