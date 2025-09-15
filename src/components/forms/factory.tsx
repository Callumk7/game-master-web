import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import type { UseMutationOptions } from "@tanstack/react-query";
import { Options } from "~/api/sdk.gen";
import type { TDataShape } from "~/api/client/types.gen";

// Generic form component factory
interface FormFactoryOptions<TData, TError, TMutationData extends TDataShape> {
  mutationOptions: (
    options?: Partial<Options<TMutationData>>,
  ) => UseMutationOptions<TData, TError, Options<TMutationData>>;
  mutationArgs?: Partial<Options<TMutationData>>;
  schema: z.ZodSchema<any>;
  fields: FieldConfig[];
  onSuccess?: (data: TData) => void;
  defaultValues?: any;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "checkbox" | "email" | "password";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  description?: string;
}

export function createFormComponent<TData, TError, TMutationData extends TDataShape>({
  mutationOptions,
  mutationArgs = {},
  schema,
  fields,
  onSuccess,
  defaultValues = {},
}: FormFactoryOptions<TData, TError, TMutationData>) {
  return function FormComponent() {
    const queryClient = useQueryClient();

    const mutationInstance = useMutation({
      ...mutationOptions(mutationArgs),
      onSuccess: (data) => {
        queryClient.invalidateQueries();
        onSuccess?.(data);
      },
    });

    const form = useForm({
      defaultValues,
      onSubmit: async ({ value }) => {
        try {
          const validatedData = schema.parse(value);
          const fullData = {
            ...mutationArgs,
            body: validatedData,
          } as unknown as Options<TMutationData>;

          await mutationInstance.mutateAsync(fullData);
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.error("Validation error:", error.issues);
          }
          throw error;
        }
      },
    });

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {fields.map((field) => (
          <form.Field
            key={field.name}
            name={field.name}
            validators={{
              onChange: ({ value }) => {
                if (field.required && !value) {
                  return `${field.label} is required`;
                }
                return undefined;
              },
            }}
          >
            {(fieldApi) => (
              <div className="form-field">
                <label htmlFor={field.name} className="block text-sm font-medium mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.description && (
                  <p className="text-sm text-gray-600 mb-2">{field.description}</p>
                )}

                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    value={(fieldApi.state.value as string) ?? ""}
                    onChange={(e) => fieldApi.handleChange(e.target.value as any)}
                    onBlur={fieldApi.handleBlur}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    value={(fieldApi.state.value as string) ?? ""}
                    onChange={(e) => fieldApi.handleChange(e.target.value as any)}
                    onBlur={fieldApi.handleBlur}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <input
                    id={field.name}
                    type="checkbox"
                    checked={(fieldApi.state.value as boolean) ?? false}
                    onChange={(e) => fieldApi.handleChange(e.target.checked as any)}
                    onBlur={fieldApi.handleBlur}
                    className="w-4 h-4"
                  />
                ) : field.type === "number" ? (
                  <input
                    id={field.name}
                    type="number"
                    value={(fieldApi.state.value as number) ?? ""}
                    onChange={(e) => fieldApi.handleChange(e.target.valueAsNumber as any)}
                    onBlur={fieldApi.handleBlur}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                ) : (
                  <input
                    id={field.name}
                    type={field.type}
                    value={(fieldApi.state.value as string) ?? ""}
                    onChange={(e) => fieldApi.handleChange(e.target.value as any)}
                    onBlur={fieldApi.handleBlur}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                )}

                {fieldApi.state.meta.errors && fieldApi.state.meta.errors.length > 0 && (
                  <p className="text-red-500 text-sm mt-1">
                    {fieldApi.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        ))}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={mutationInstance.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
          >
            {mutationInstance.isPending ? "Submitting..." : "Submit"}
          </button>

          <button
            type="reset"
            onClick={() => form.reset()}
            className="px-4 py-2 bg-gray-300 rounded-md"
          >
            Reset
          </button>
        </div>

        {mutationInstance.isError && (
          <div className="text-red-500 text-sm">
            Error: {(mutationInstance.error as any)?.message || "Something went wrong"}
          </div>
        )}
      </form>
    );
  };
}

// Direct usage without factory for more control
export function useFormWithMutation<TData, TError, TMutationData extends TDataShape>({
  mutationOptions,
  mutationArgs = {},
  schema,
  onSuccess,
  defaultValues = {},
}: {
  mutationOptions: (
    options?: Partial<Options<TMutationData>>,
  ) => UseMutationOptions<TData, TError, Options<TMutationData>>;
  mutationArgs?: Partial<Options<TMutationData>>;
  schema: z.ZodSchema<any>;
  onSuccess?: (data: TData) => void;
  defaultValues?: any;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...mutationOptions(mutationArgs),
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      onSuccess?.(data);
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        const validatedData = schema.parse(value);
        const fullData = {
          ...mutationArgs,
          body: validatedData,
        } as unknown as Options<TMutationData>;

        await mutation.mutateAsync(fullData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation error:", error.issues);
        }
        throw error;
      }
    },
  });

  return { form, mutation };
}
