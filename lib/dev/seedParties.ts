import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export async function seedBasic() {
  await addDoc(collection(db, "parties"), { type: "SUPPLIER", name: "Green Farms" });
  await addDoc(collection(db, "parties"), { type: "CUSTOMER", name: "City Mart" });
  await addDoc(collection(db, "items"), { name: "Potato", sku: "POT-001", unit: "kg", category: "Vegetable" });
  await addDoc(collection(db, "warehouses"), { name: "Main" });
}