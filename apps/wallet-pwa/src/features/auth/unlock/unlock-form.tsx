import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FormEventHandler, useEffect } from "react";
import { Member } from "@stores/members";
import { Button, Card, H3, P, Input, Label, Error, clsxm } from "sparks-ui"
import { Buffer } from "buffer";

const formSchema = z.object({
  identity: z.string().min(1, { message: 'identity nonce required' }).max(Number.MAX_SAFE_INTEGER),
  password: z.string().min(1, { message: 'identity name required' }).max(50),
});

type FormSchemaType = z.infer<typeof formSchema>;
type FormHandlerType = FormEventHandler<HTMLDivElement> & SubmitHandler<FormSchemaType>

type UnlockFormProps = {
  onSubmit: FormHandlerType;
  className?: string;
  identity: Member;
  children?: React.ReactNode;
  error: string | undefined;
}

export const UnlockForm = ({ identity, error, className = '', onSubmit }: UnlockFormProps) => {
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<FormSchemaType>({ resolver: zodResolver(formSchema), defaultValues: { identity: identity.data, password: '' } });

  useEffect(() => {
    if (error) setError('password', { message: error })
  }, [error])

  return (
    <Card className={clsxm("w-full", className)}>
      <H3 className={clsxm('mb-2 text-center')}>
        Master Password
      </H3>
      <P className="mt-2 mb-8 text-left">
        Please enter your master password for your '{Buffer.from(identity.name, 'base64').toString('utf-8')}' identity
      </P>
      <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Input
            id="identity"
            type="hidden"
            registration={register("identity")}
          />
          <Label>Password</Label>
          <Input
            id="password"
            type="password"
            fullWidth
            registration={register("password")}
          />
          <Error>{errors.password?.message}</Error>
        </div>
        <div className="flex justify-stretch gap-x-4">
          <Button onClick={() => navigate('/')} color="warning" fullWidth>Back</Button>
          <Button type="submit" disabled={isSubmitting} fullWidth>Unlock</Button>
        </div>
      </form>
    </Card>
  )
}