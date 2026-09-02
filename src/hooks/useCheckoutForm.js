import { useState } from "react";
import { validate } from "@/libs/validation";
import { MOYEN_PAR_DEFAUT } from "@/libs/stockage/contrat";

const emptyForm = {
  email: "",
  firstName: "",
  lastName: "",
  moyen: MOYEN_PAR_DEFAUT,
};

export function useCheckoutForm() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const setField = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const err = validate(form);
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
  };

  return { form, setForm, setField, errors, validateForm, resetForm };
}
