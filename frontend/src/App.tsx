import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

type Freight = {
  id?: number;
  status: string;
  attributes: Record<string, string | number>;
  createdAt?: string;
  updatedAt?: string;
};

type FreightEditableRow = Freight & {
  _editAttrs: { key: string; value: string }[];
};

type FreightPageResponse = {
  content: Freight[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  last: boolean;
  totalPages?: number;
};

export default function App() {
  const [newStatus, setNewStatus] = useState("");
  const [newAttrs, setNewAttrs] = useState<{ key: string; value: string }[]>([]);

  
  const [q, setQ] = useState("");

  
  const [rows, setRows] = useState<FreightEditableRow[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLast, setIsLast] = useState(true);

  
  async function load() {
    const res = await api.get<FreightPageResponse>("/freights", {
      params: {
        q: q || undefined,
        page,
      },
    });

    const data = res.data;

  
    const list: FreightEditableRow[] = (data.content || []).map((f) => ({
      ...f,
      _editAttrs: Object.entries(f.attributes || {}).map(([key, value]) => ({
        key,
        value: String(value ?? ""),
      })),
    }));

    setRows(list);

    if (typeof data.totalPages === "number") {
      setTotalPages(data.totalPages);
    } else {
      setTotalPages(
        data.last
          ? data.pageable.pageNumber + 1
          : data.pageable.pageNumber + 2
      );
    }

    setIsLast(data.last);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page]);

  async function create() {
   
    const attributesObj: Record<string, string> = {};

    if (newStatus.trim() !== "") {
      attributesObj["identificador"] = newStatus.trim();
    }

    for (const { key, value } of newAttrs) {
      if (key.trim() !== "") {
        attributesObj[key] = value;
      }
    }

   
    await api.post("/freights", {
      status: "",
      attributes: attributesObj,
    });

    
    setNewStatus("");
    setNewAttrs([]);
    setPage(0);

    load();
  }

  async function remove(id: number) {
    await api.delete(`/freights/${id}`);
    load();
  }

  async function update(r: FreightEditableRow) {
   
    const attributesObj: Record<string, string> = {};
    for (const pair of r._editAttrs) {
      const k = pair.key.trim();
      if (k !== "") {
        attributesObj[k] = pair.value;
      }
    }

    await api.put(`/freights/${r.id}`, {
      status: r.status,
      attributes: attributesObj,
    });

    load();
    alert("Frete atualizado");
  }

  function addAttrToRow(id: number | undefined) {
    if (id === undefined) return;
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              _editAttrs: [...row._editAttrs, { key: "", value: "" }],
            }
          : row
      )
    );
  }

  function updateAttrKeyInRow(
    id: number | undefined,
    index: number,
    newKey: string
  ) {
    if (id === undefined) return;
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const copy = [...row._editAttrs];
        copy[index] = { ...copy[index], key: newKey };
        return { ...row, _editAttrs: copy };
      })
    );
  }

  function updateAttrValueInRow(
    id: number | undefined,
    index: number,
    newValue: string
  ) {
    if (id === undefined) return;
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const copy = [...row._editAttrs];
        copy[index] = { ...copy[index], value: newValue };
        return { ...row, _editAttrs: copy };
      })
    );
  }

  function removeAttrFromRow(id: number | undefined, index: number) {
    if (id === undefined) return;
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const filtered = row._editAttrs.filter((_, i) => i !== index);
        return { ...row, _editAttrs: filtered };
      })
    );
  }

  const canPrev = useMemo(() => page > 0, [page]);
  const canNext = useMemo(() => !isLast, [isLast]);

  return (
    <main className="max-w-3xl mx-auto p-6 font-sans text-gray-100">
      <h1 className="text-3xl font-bold mb-6">AZShip – Gestão de Fretes</h1>

      
      <section className="flex flex-col sm:flex-row gap-3 mb-4">
        <h2 className="flex items-center text-white text-base font-medium">
          Filtro por Propriedade
        </h2>

        <input
          className="w-full sm:w-1/2 rounded-md bg-gray-900 border border-gray-600 px-3 py-2 text-sm outline-none focus:border-blue-400 text-white"
          placeholder="Buscar (Identificador ou atributo)"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
        />
      </section>

   
      <section className="border border-gray-600 rounded-lg p-4 mb-6 bg-gray-950">
        <h3 className="text-lg font-semibold mb-4 text-white">Novo Frete</h3>

        <div className="flex flex-col md:flex-row gap-6">
   
          <div className="flex flex-col gap-3 w-full md:w-56">
         
            <input
              className="rounded-md bg-gray-900 border border-gray-600 px-3 py-2 text-sm outline-none focus:border-blue-400 text-white"
              placeholder="Identificação (nome ou semelhante)"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            />

            <button
              className="rounded-md bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700 active:scale-[0.98] transition"
              onClick={() =>
                setNewAttrs((a) => [...a, { key: "", value: "" }])
              }
            >
              Adicionar Campo customizado
            </button>

            <button
              className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-medium hover:bg-blue-500 active:scale-[0.98] transition"
              onClick={create}
            >
              Criar
            </button>
          </div>

      
          <div className="flex-1 text-sm">
            {newAttrs.length === 0 && (
              <i className="text-gray-400">
                Nenhum campo customizado. Adicione usando "Adicionar Campo
                customizado".
              </i>
            )}

            {newAttrs.map((kv, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2"
              >
                <input
                  className="w-full sm:w-40 rounded-md bg-gray-900 border border-gray-600 px-3 py-2 text-sm outline-none focus:border-blue-400 text-white"
                  placeholder='chave (ex: "peso")'
                  value={kv.key}
                  onChange={(e) =>
                    setNewAttrs((a) =>
                      a.map((x, i) =>
                        i === idx ? { ...x, key: e.target.value } : x
                      )
                    )
                  }
                />

                <input
                  className="w-full sm:w-40 rounded-md bg-gray-900 border border-gray-600 px-3 py-2 text-sm outline-none focus:border-blue-400 text-white"
                  placeholder='valor (ex: "200kg")'
                  value={kv.value}
                  onChange={(e) =>
                    setNewAttrs((a) =>
                      a.map((x, i) =>
                        i === idx ? { ...x, value: e.target.value } : x
                      )
                    )
                  }
                />

                <button
                  className="rounded-md bg-red-600 text-white px-3 py-2 text-xs font-medium hover:bg-red-500 active:scale-[0.98] transition"
                  onClick={() =>
                    setNewAttrs((a) => a.filter((_, i) => i !== idx))
                  }
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

    
      <section className="space-y-6">
        {rows.map((r) => (
          <article
            key={r.id}
            className="border border-gray-700 bg-gray-900 rounded-lg p-4"
          >
          
            <header className="flex flex-col md:flex-row md:items-start gap-4 flex-wrap text-sm text-white">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">ID</span>
                <span className="font-semibold text-base">#{r.id}</span>
              </div>

          

              <div className="flex gap-2">
                <button
                  className="rounded-md bg-green-600 text-white px-3 py-1 text-xs font-medium hover:bg-green-500 active:scale-[0.98] transition"
                  onClick={() => update(r)}
                >
                  Salvar
                </button>

                <button
                  className="rounded-md bg-red-600 text-white px-3 py-1 text-xs font-medium hover:bg-red-500 active:scale-[0.98] transition"
                  onClick={() => remove(r.id!)}
                >
                  Excluir
                </button>
              </div>
            </header>

         
            <section className="mt-4">
              <div className="flex items-center justify-between flex-wrap mb-2">
                <span className="text-xs text-gray-300 font-medium">
                  Atributos
                </span>

                <button
                  className="rounded-md bg-gray-800 border border-gray-600 px-2 py-1 text-[11px] text-white hover:bg-gray-700 active:scale-[0.98] transition"
                  onClick={() => addAttrToRow(r.id)}
                >
                  + adicionar atributo
                </button>
              </div>

              {r._editAttrs.length === 0 && (
                <i className="text-gray-500 text-xs">
                  Nenhum atributo neste frete.
                </i>
              )}

              <div className="flex flex-col gap-3">
                {r._editAttrs.map((pair, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-950 border border-gray-700 rounded-md p-3 text-xs text-gray-200"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="text-[10px] text-gray-400 uppercase mb-1">
                        Chave
                      </div>
                      <input
                        className="w-full sm:w-40 rounded-md bg-gray-900 border border-gray-600 px-2 py-1 text-xs outline-none focus:border-blue-400 text-white"
                        placeholder='ex: "peso"'
                        value={pair.key}
                        onChange={(e) =>
                          updateAttrKeyInRow(r.id, idx, e.target.value)
                        }
                      />
                    </div>

                    <div className="flex-1 w-full sm:w-auto">
                      <div className="text-[10px] text-gray-400 uppercase mb-1">
                        Valor
                      </div>
                      <input
                        className="w-full sm:w-40 rounded-md bg-gray-900 border border-gray-600 px-2 py-1 text-xs outline-none focus:border-blue-400 text-white"
                        placeholder='ex: "200kg"'
                        value={pair.value}
                        onChange={(e) =>
                          updateAttrValueInRow(r.id, idx, e.target.value)
                        }
                      />
                    </div>

                    <button
                      className="rounded-md bg-red-600 text-white px-2 py-1 text-[10px] font-medium hover:bg-red-500 active:scale-[0.98] transition h-[28px] mt-[18px] sm:mt-[22px]"
                      onClick={() => removeAttrFromRow(r.id, idx)}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </article>
        ))}
      </section>

      <footer className="flex flex-col sm:flex-row gap-3 items-center mt-8 text-sm text-gray-200">
        <button
          disabled={!canPrev}
          onClick={() => setPage((p) => p - 1)}
          className={`rounded-md px-4 py-2 border border-gray-600 bg-gray-800 font-medium transition active:scale-[0.98] ${
            canPrev ? "hover:bg-gray-700" : "opacity-40 cursor-not-allowed"
          }`}
        >
          Anterior
        </button>

        <span className="text-gray-300">
          Página {page + 1} / {Math.max(totalPages, 1)}
        </span>

        <button
          disabled={!canNext}
          onClick={() => setPage((p) => p + 1)}
          className={`rounded-md px-4 py-2 border border-gray-600 bg-gray-800 font-medium transition active:scale-[0.98] ${
            canNext ? "hover:bg-gray-700" : "opacity-40 cursor-not-allowed"
          }`}
        >
          Próxima
        </button>
      </footer>
    </main>
  );
}
