import { z } from "zod";

export const CreateAppointmentSchema = z.object({
  insuredId: z
    .string()
    .trim()
    .length(5, "InsuredId must be exactly 5 characters")
    .regex(/^\d{5}$/, "InsuredId must contain only digits"),

  scheduleId: z
    .number()
    .int("ScheduleId must be an integer")
    .positive("ScheduleId must be a positive number"),

  countryISO: z.enum(["PE", "CL"], {
    errorMap: () => ({ message: "CountryISO must be either PE or CL" }),
  }),
});

export type CreateAppointmentDto = z.infer<typeof CreateAppointmentSchema>;

export function validateCreateAppointmentDto(
  data: unknown
): CreateAppointmentDto {
  try {
    return CreateAppointmentSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      throw new Error(`Validation failed: ${messages.join(", ")}`);
    }
    throw error;
  }
}
