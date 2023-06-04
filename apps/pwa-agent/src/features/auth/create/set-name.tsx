import { Button, Card, H3, P, Input, Label, Error, clsxm } from "sparks-ui"
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FormEventHandler } from "react";

const formSchema = z.object({
  name: z.string().min(1, { message: 'identity name required' }).max(50),
});

export type FormSchemaType = z.infer<typeof formSchema>;
export type FormHandlerType = FormEventHandler<HTMLDivElement> & SubmitHandler<FormSchemaType>
export type SetNameProps = { className?: string, onSubmit: SubmitHandler<FormSchemaType> }

export const SetName = ({ className = '', onSubmit }: SetNameProps) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormSchemaType>({ resolver: zodResolver(formSchema) });

  return (
    <Card className={clsxm("w-full", className)}>
      <H3 className={clsxm('mb-2 text-center')}>
        Name Your Identity
      </H3>
      <P className="mt-2 mb-8 text-left">
        Provide a name for your identity. The name is stored only locally, you can change it later if you wish.
      </P>
      <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label>Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="personal"
            registration={register("name")}
          />
          <Error>{errors.name?.message}</Error>
        </div>
        <div className="flex justify-stretch gap-x-4">
          <Button onClick={() => navigate('')} color="warning" fullWidth>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} fullWidth>Next</Button>
        </div>
      </form>
    </Card>
  )
}