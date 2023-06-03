import { Button, Card, H3, P } from "ui"
import { clsxm } from "@libraries/clsxm";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FormEventHandler } from "react";
import { Input } from "@components/form";

const formSchema = z.object({
  password: z.string().min(8, { message: 'password min 8 characters required' }).max(50),
});

export type FormSchemaType = z.infer<typeof formSchema>;
export type FormHandlerType = FormEventHandler<HTMLDivElement> & SubmitHandler<FormSchemaType>
export type SetPasswordProps = { className?: string, onSubmit: SubmitHandler<FormSchemaType> }

export const SetPassword = ({ className = '', onSubmit }: SetPasswordProps) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormSchemaType>({ resolver: zodResolver(formSchema) });

  return (
    <Card className={clsxm("w-full", className)}>
      <H3 className={clsxm('mb-2 text-center')}>
        Protect Identity
      </H3>
      <P className="mt-2 mb-8 text-left">
        Provide a master password for your identity. This password is not stored anywhere and is used to encrypt your identity data.
      </P>
      <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="long password or phrase"
          registration={register("password")}
          error={errors.password?.message}
        />
        <div className="flex justify-stretch gap-x-4">
          <Button onClick={() => navigate('/')} color="warning" fullWidth>Back</Button>
          <Button type="submit" disabled={isSubmitting} fullWidth>Next</Button>
        </div>
      </form>
    </Card>
  )
}