import { LoadingOverlay } from "@mantine/core";

export function NotFound(props) {
  if (props.pending) return <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2 }} />;
  if (!props.pending && !props.session) return <div>Forbidden for Anuathorised user</div>;

  return (
    <section>
      <h1>404: Not Found</h1>
      <p>It's gone :(</p>
    </section>
  );
}
