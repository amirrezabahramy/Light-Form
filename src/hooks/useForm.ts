import React from "react";

function useForm<TFields extends Record<string, string | number>>({
  defaultValues,
  onSubmit,
}: {
  defaultValues: TFields;
  onSubmit: (fields: TFields) => Promise<void>;
}) {
  // Field states
  const [fields, setFields] = React.useState(defaultValues);

  const [isBlured, setBlured] = React.useState(
    Object.fromEntries(
      Object.keys(defaultValues).map((name) => [name, false])
    ) as Record<keyof TFields, boolean>
  );
  const [isTouched, setTouched] = React.useState(
    Object.fromEntries(
      Object.keys(defaultValues).map((name) => [name, false])
    ) as Record<keyof TFields, boolean>
  );
  const [isDirty, setDirty] = React.useState(
    Object.fromEntries(
      Object.keys(defaultValues).map((name) => [name, false])
    ) as Record<keyof TFields, boolean>
  );

  // Field handlers
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    !isDirty[event.target.name] &&
      setDirty((prev) => ({ ...prev, [event.target.name]: true }));
    setFields((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    !isBlured[event.target.name] &&
      setBlured((prev) => ({ ...prev, [event.target.name]: true }));
  };
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    !isTouched[event.target.name] &&
      setTouched((prev) => ({ ...prev, [event.target.name]: true }));
  };

  // Controllers
  const setOne = (
    name: keyof TFields,
    value: string | number,
    makeFieldDirty: boolean
  ) => {
    makeFieldDirty &&
      !isDirty[name] &&
      setDirty((prev) => ({ ...prev, [name]: true }));
    setFields((prev) => ({ ...prev, [name]: value }));
  };
  const getOne = (name: keyof TFields) => {
    return fields[name];
  };
  const setMany = (fields: Partial<TFields>, makeFieldsDirty: boolean) => {
    makeFieldsDirty &&
      setDirty((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.keys(fields)
            .filter((name) => !isDirty[name])
            .map((name) => [name, true])
        ),
      }));
    setFields((prev) => ({ ...prev, ...fields }));
  };
  const getMany = (...names: Array<keyof TFields>) => {
    return Object.fromEntries(
      Object.entries(fields).filter(([name]) => names.includes(name))
    );
  };

  // Submit states
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // Main utils
  const control = (name: keyof TFields) => {
    return {
      name,
      value: fields[name],
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      setStatus("loading");
      await onSubmit(fields);
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };

  const reset = (fields: Partial<TFields>) => {
    setFields({ ...defaultValues, ...fields });
  };

  // Return object
  return {
    control,
    handleSubmit,
    reset,
    fieldStates: {
      fields,
      isBlured,
      isTouched,
      isDirty,
    },
    fieldHandlers: {
      handleChange,
      handleBlur,
      handleFocus,
    },
    controllers: {
      setOne,
      getOne,
      setMany,
      getMany,
    },
    submitStates: {
      status,
      isLoading: status === "loading",
      isSuccess: status === "success",
      isError: status === "error",
    },
  };
}

export default useForm;
