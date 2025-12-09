export const FormFieldError = ({ message }: { message: string }) => {
  return (
    <div className="border-danger bg-danger h-10 w-full">
      Error with value: <p>{message}</p>
    </div>
  );
};
