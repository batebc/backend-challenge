export type StatusType = "pending" | "completed";

export class AppointmentStatus {
  private readonly value: StatusType;

  constructor(value: string) {
    this.validate(value);
    this.value = value.trim().toLowerCase() as StatusType;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error("AppointmentStatus cannot be empty");
    }

    const normalized = value.trim().toLowerCase();

    if (normalized !== "pending" && normalized !== "completed") {
      throw new Error("AppointmentStatus must be either pending or completed");
    }
  }

  getValue(): StatusType {
    return this.value;
  }

  isPending(): boolean {
    return this.value === "pending";
  }

  isCompleted(): boolean {
    return this.value === "completed";
  }

  equals(other: AppointmentStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static pending(): AppointmentStatus {
    return new AppointmentStatus("pending");
  }

  static completed(): AppointmentStatus {
    return new AppointmentStatus("completed");
  }
}
