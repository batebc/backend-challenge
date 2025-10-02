export type CountryCode = "PE" | "CL";

export class CountryISO {
  private readonly value: CountryCode;

  constructor(value: string) {
    this.validate(value);
    this.value = value.trim().toUpperCase() as CountryCode;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error("CountryISO cannot be empty");
    }

    const normalized = value.trim().toUpperCase();

    if (normalized !== "PE" && normalized !== "CL") {
      throw new Error("CountryISO must be either PE or CL");
    }
  }

  getValue(): CountryCode {
    return this.value;
  }

  isPeru(): boolean {
    return this.value === "PE";
  }

  isChile(): boolean {
    return this.value === "CL";
  }

  equals(other: CountryISO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
