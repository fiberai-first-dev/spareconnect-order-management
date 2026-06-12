import { redirect } from "next/navigation";

export default function OrderDetailRedirect() {
  redirect("/orders");
}
