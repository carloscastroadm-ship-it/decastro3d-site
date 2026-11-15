
import { getUser } from "@netlify/identity";
import { getStore } from "@netlify/blobs";

const store = getStore("decastro3d");
const KEY = "catalogo-principal";

export default async (req) => {
  try {
    const user = await getUser();

    if (!user) {
      return new Response("Acesso não autorizado.", { status: 401 });
    }

    if (!user.roles?.includes("ADM")) {
      return new Response("Acesso restrito ao administrador.", {
        status: 403
      });
    }

    if (req.method === "GET") {
      const data = await store.get(KEY, { type: "json" });

      return Response.json(data || {
        products: [],
        settings: {},
        contacts: {}
      });
    }

    if (req.method === "PUT") {
      const data = await req.json();

      if (
        !data ||
        !Array.isArray(data.products) ||
        typeof data.settings !== "object" ||
        typeof data.contacts !== "object"
      ) {
        return new Response("Dados inválidos.", { status: 400 });
      }

      await store.setJSON(KEY, data);

      return Response.json({
        success: true,
        message: "Catálogo salvo."
      });
    }

    return new Response("Método não permitido.", { status: 405 });

  } catch (error) {
    console.error(error);
    return new Response("Erro interno ao acessar o catálogo.", {
      status: 500
    });
  }
};
