export class InsuredId {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value.trim();
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error("InsuredId cannot be empty");
    }
    const trimmed = value.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      throw new Error("InsuredId must be exactly 5 digits");
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: InsuredId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
