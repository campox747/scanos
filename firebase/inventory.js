import { db } from './firebaseConfig.js'; 
import { doc, setDoc } from "firebase/firestore"; 

async function createInventory() {

    // Define Products
    const products = [
    { sku: "XRP-APPLE", name: "Apple", count: 10 },
    { sku: "XRP-BOOK", name: "Book", count: 6 },
    { sku: "XRP-WB", name: "Water Bottle", count: 7 }
  ];

  for (const item of products) {

    const docRef = doc(db, "inventory", item.sku);
    
    await setDoc(docRef, {
      name: item.name,
      expected_count: item.count,
      actual_count: 0,
      status: "pending",
      last_audit: new Date()
    });
  }

  console.log("Inventory collection created");
}

createInventory();