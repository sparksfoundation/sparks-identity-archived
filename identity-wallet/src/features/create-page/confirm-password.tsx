import { H3, P } from "@components/elements";
import { Button } from "@components/elements/buttons";
import { Card, CardProps } from "@components/elements/card";
import { clsxm } from "@libraries/clsxm";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FormEventHandler, useEffect } from "react";
import { Input } from "@components/form";

const formSchema = z.object({
  confirm: z.string().min(8, { message: 'password min 8 characters required' }).max(50),
});

export type FormSchemaType = z.infer<typeof formSchema>;
export type FormHandlerType = FormEventHandler<HTMLDivElement> & SubmitHandler<FormSchemaType>
type FormProps = CardProps & { onSubmit: SubmitHandler<FormSchemaType>, error?: string }

export const ConfirmPassword = ({ error, className = '', onSubmit }: FormProps) => {
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<FormSchemaType>({ resolver: zodResolver(formSchema) });

  useEffect(() => {
    if (error) {
      setError('confirm', {
        type: 'manual',
        message: error,
      })
    }
  }, [error])

  return (
    <Card className={clsxm("w-full", className)}>
      <H3 className={clsxm('mb-2 text-center')}>
        Confirm Password
      </H3>
      <P className="mt-2 mb-8 text-left">
        Confirm your master password. This password is not stored anywhere and is used to encrypt your identity data.
      </P>
      <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="confirm"
          type="password"
          label="Confrim Password"
          placeholder="confirm long password or phrase"
          registration={register("confirm")}
          error={errors.confirm?.message}
        />
        <div className="flex justify-stretch gap-x-4">
          <Button onClick={() => navigate('/')} warning full>Back</Button>
          <Button type="submit" disabled={isSubmitting} full>Next</Button>
        </div>
      </form>
    </Card>
  )
}
