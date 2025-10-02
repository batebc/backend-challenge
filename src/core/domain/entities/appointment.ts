import { InsuredId } from "../value-objects/insured-id";
import { CountryISO } from "../value-objects/country-iso";
import { AppointmentStatus } from "../value-objects/appointment-status";

export interface AppointmentProps {
  appointmentId: string;
  insuredId: InsuredId;
  scheduleId: number;
  countryISO: CountryISO;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Appointment {
  private readonly props: AppointmentProps;

  constructor(props: AppointmentProps) {
    this.validateProps(props);
    this.props = props;
  }

  private validateProps(props: AppointmentProps): void {
    if (!props.appointmentId || props.appointmentId.trim().length === 0) {
      throw new Error("AppointmentId cannot be empty");
    }

    if (!props.scheduleId || props.scheduleId <= 0) {
      throw new Error("ScheduleId must be a positive number");
    }

    if (!props.createdAt) {
      throw new Error("CreatedAt is required");
    }

    if (!props.updatedAt) {
      throw new Error("UpdatedAt is required");
    }
  }

  get appointmentId(): string {
    return this.props.appointmentId;
  }

  get insuredId(): InsuredId {
    return this.props.insuredId;
  }

  get scheduleId(): number {
    return this.props.scheduleId;
  }

  get countryISO(): CountryISO {
    return this.props.countryISO;
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  markAsCompleted(): Appointment {
    if (this.props.status.isCompleted()) {
      throw new Error("Appointment is already completed");
    }

    return new Appointment({
      ...this.props,
      status: AppointmentStatus.completed(),
      updatedAt: new Date(),
    });
  }

  isPending(): boolean {
    return this.props.status.isPending();
  }

  isCompleted(): boolean {
    return this.props.status.isCompleted();
  }

  toObject() {
    return {
      appointmentId: this.props.appointmentId,
      insuredId: this.props.insuredId.getValue(),
      scheduleId: this.props.scheduleId,
      countryISO: this.props.countryISO.getValue(),
      status: this.props.status.getValue(),
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }

  static create(params: {
    appointmentId: string;
    insuredId: string;
    scheduleId: number;
    countryISO: string;
  }): Appointment {
    const now = new Date();

    return new Appointment({
      appointmentId: params.appointmentId,
      insuredId: new InsuredId(params.insuredId),
      scheduleId: params.scheduleId,
      countryISO: new CountryISO(params.countryISO),
      status: AppointmentStatus.pending(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(data: {
    appointmentId: string;
    insuredId: string;
    scheduleId: number;
    countryISO: string;
    status: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  }): Appointment {
    return new Appointment({
      appointmentId: data.appointmentId,
      insuredId: new InsuredId(data.insuredId),
      scheduleId: data.scheduleId,
      countryISO: new CountryISO(data.countryISO),
      status: new AppointmentStatus(data.status),
      createdAt:
        typeof data.createdAt === "string"
          ? new Date(data.createdAt)
          : data.createdAt,
      updatedAt:
        typeof data.updatedAt === "string"
          ? new Date(data.updatedAt)
          : data.updatedAt,
    });
  }
}
