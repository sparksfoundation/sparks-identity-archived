import { H3, P } from "@components/elements";
import { Button } from "@components/elements/buttons";
import { Card, CardProps } from "@components/elements/card";
import { clsxm } from "@libraries/clsxm";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FormEventHandler } from "react";
import { Input } from "@components/form";

const formSchema = z.object({
  name: z.string().min(1, { message: 'identity name required' }).max(50),
});

export type FormSchemaType = z.infer<typeof formSchema>;
export type FormHandlerType = FormEventHandler<HTMLDivElement> & SubmitHandler<FormSchemaType>

export const SetName = ({ className = '', onSubmit }: CardProps & { onSubmit: SubmitHandler<FormSchemaType> }) => {
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
        <Input
          id="name"
          type="text"
          label="Name"
          placeholder="personal"
          registration={register("name")}
          error={errors.name?.message}
        />
        <div className="flex justify-stretch gap-x-4">
          <Button onClick={() => navigate('/')} warning full>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} full>Next</Button>
        </div>
      </form>
    </Card>
  )
}