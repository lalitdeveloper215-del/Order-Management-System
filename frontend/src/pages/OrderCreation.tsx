import React, { useState } from "react";
import { useApi } from "../hooks/useApi";
import { PlusCircle, Trash2, Send } from "lucide-react";

const OrderCreation = () => {
  const { api, execute, error } = useApi();
  const [items, setItems] = useState<{ productId: number | ""; quantity: number | "" }[]>([{ productId: "", quantity: "" }]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value ? parseInt(value) : "";
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { productId: "", quantity: "" }]);

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    
    // Validate
    const validItems = items.filter(item => item.productId !== "" && typeof item.productId === "number" && item.quantity !== "" && (item.quantity as number) > 0);
    if (validItems.length === 0) {
        setLoading(false);
        return;
    }

    const payload = { items: validItems };
    const result = await execute(api.post("/orders", payload));
    
    if (result) {
      setSuccessMsg(`Order #${result.id} placed successfully! Queue is processing it.`);
      setItems([{ productId: "", quantity: "" }]);
    }
    setLoading(false);
  };

  return (
    <div className="glass-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="header">
        <h2>Create Order</h2>
      </div>

      {error && <div className="badge error" style={{ marginBottom: "1rem", display: "inline-block" }}>{error}</div>}
      {successMsg && <div className="badge success" style={{ marginBottom: "1rem", display: "inline-block" }}>{successMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {items.map((item, index) => (
            <div key={index} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input
                type="number"
                placeholder="Product ID"
                className="input"
                value={item.productId}
                onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Qty"
                className="input"
                value={item.quantity}
                min="1"
                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                title="Remove Item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button type="button" className="btn btn-secondary" onClick={addItem}>
            <PlusCircle size={16} /> Add another item
          </button>
        </div>

        <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? <div className="loader" style={{ width: '16px', height: '16px', margin: 0, borderWidth: '2px' }}/> : <><Send size={16} /> Submit Order</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderCreation;
