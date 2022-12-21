import { ActionFunction, redirect } from "remix";
import { createPost } from "~/workspace/posts.server";

export const action: ActionFunction = async ({ request }) => {
  const data = new URLSearchParams(
    await request.text(),
  );

  await createPost(data);
  return redirect(`/`);
};

export default function EmergencyBloggingInterface() {
  return (
    <form
      method="post"
      className="flex flex-col max-w-prose space-y-2 m-auto"
    >
      <input
        name="title"
        type="text"
        placeholder="title"
        className="border p-2"
        required
      />

      <input
        name="description"
        type="text"
        placeholder="description"
        className="border p-2"
        required
      />

      <textarea name="body" placeholder="post" className="border p-2" required>
      </textarea>

      <input
        name="secret"
        type="password"
        placeholder="secret"
        className="border p-2"
        required
      />

      <input
        name="slug"
        type="text"
        placeholder="post slug"
        className="border p-2"
        required
      />

      <button type="submit" className="border bg-yellow-300 p-2">Post</button>
    </form>
  );
}
