import { Button, Card, H3, P, Input, Error, clsxm, Label} from "sparks-ui"
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FormEventHandler, useEffect } from "react";

const formSchema = z.object({
  confirm: z.string().min(8, { message: 'password min 8 characters required' }).max(50),
});

export type FormSchemaType = z.infer<typeof formSchema>;
export type FormHandlerType = FormEventHandler<HTMLDivElement> & SubmitHandler<FormSchemaType>
type ConfirmPasswordProps = { error?: string, className?: string, onSubmit: SubmitHandler<FormSchemaType> }

export const ConfirmPassword = ({ error, className = '', onSubmit }: ConfirmPasswordProps) => {
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
        <div>
          <Label>Confirm Password</Label>
          <Input
            id="confirm"
            type="password"
            placeholder="confirm long password or phrase"
            registration={register("confirm")}
          />
          <Error>{errors.confirm?.message}</Error>
        </div>
        <div className="flex justify-stretch gap-x-4">
          <Button onClick={() => navigate('/')} color="warning" fullWidth>Back</Button>
          <Button type="submit" disabled={isSubmitting} fullWidth>Next</Button>
        </div>
      </form>
    </Card>
  )
}
