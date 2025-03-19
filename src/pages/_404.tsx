import { useLocation } from "preact-iso";

export function NotFound() {
  const location = useLocation();
  if (["", ".", "/"].some((a) => a === location.url)) {
    location.route("/dashboard");
  }

  return (
    <section>
      <h1>404: Not Found</h1>
      <p>It's gone :(</p>
    </section>
  );
}
