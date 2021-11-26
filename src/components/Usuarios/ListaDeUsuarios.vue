<template>
  <div class="columns">
    <div class="column">
      <b-button
        :loading="cargando"
        @click="agregarUsuario()"
        class="is-success mb-5"
        icon-right="plus"
        >Nuevo</b-button
      >
      <b-table
        :data="usuarios"
        :loading="cargando"
        :mobile-cards="true"
        hoverable
      >
        <b-table-column
          searchable
          field="nombre"
          label="Nombre"
          v-slot="props"
          sortable
        >
          {{ props.row.nombre }}
        </b-table-column>
        <b-table-column field="id" label="Opciones" v-slot="props">
          <b-button class="mb-1" @click="editar(props.row)" type="is-warning">
            <b-icon icon="pencil"></b-icon>
          </b-button>
          &nbsp;
          <b-button
            class="mb-1"
            @click="eliminar(props.row, props.index)"
            type="is-danger"
          >
            <b-icon icon="delete"></b-icon>
          </b-button>
        </b-table-column>
        <template #empty>
          <div class="has-text-centered">No hay registros</div>
        </template>
      </b-table>
    </div>
  </div>
</template>
<script>
import BaseDeDatosService from "../../services/BaseDeDatosService";
import { deleteDoc, doc } from "firebase/firestore";
export default {
  data: () => ({
    cargando: false,
    usuarios: [],
    coleccionUsuarios: null,
  }),
  async mounted() {
    this.coleccionUsuarios = await BaseDeDatosService.obtenerColeccionUsuarios();
    this.cargando = true;
    const instantanea = await BaseDeDatosService.obtenerUsuarios();
    this.usuarios = [];
    instantanea.forEach((datoInstantanea) => {
      this.usuarios.push({
        id: datoInstantanea.id,
        nombre: datoInstantanea.data().nombre,
      });
    });
    this.cargando = false;
  },
  methods: {
    agregarUsuario() {
      this.$router.push({ name: "AgregarUsuario" });
    },
    editar(usuario) {
      this.$router.push({ name: "EditarUsuario", params: { id: usuario.id } });
    },
    eliminar(usuario, indice) {
      this.$buefy.dialog.confirm({
        message: `¿Eliminar usuario <strong>${usuario.nombre}</strong>?`,
        cancelText: "Cancelar",
        confirmText: "Sí, eliminar",
        onConfirm: async () => {
          this.cargando = true;
          await deleteDoc(
            doc(await BaseDeDatosService.obtener(), "usuarios", usuario.id)
          );
          this.cargando = false;
          // Como no estamos escuchando cambios de Firebase y queremos
          // ahorrar ancho de banda (evitando consultar todos los elementos al eliminar)
          // lo que hacemos es eliminar el elemento del arreglo local basado en su índice una vez que
          // tenemos la certeza de que fue eliminado en el almacenamiento del servidor
          this.usuarios.splice(indice, 1);
        },
      });
    },
  },
};
</script>