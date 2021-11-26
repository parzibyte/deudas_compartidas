<template>
  <div class="columns">
    <div class="column">
      <h3 class="is-size-3">Editar usuario</h3>
      <b-field label="Nombre">
        <b-input
          :loading="cargando"
          v-model="nombreUsuario"
          type="text"
        ></b-input
      ></b-field>
      <b-button
        @click="volver()"
        :loading="cargando"
        class="is-info"
        icon-left="arrow-left"
        >Volver</b-button
      >
      &nbsp;
      <b-button :loading="cargando" type="is-success" @click="guardar()"
        >Guardar</b-button
      >
    </div>
  </div>
</template>
<script>
import { doc, getDoc, updateDoc } from "firebase/firestore";
import BaseDeDatosService from "../../services/BaseDeDatosService";
export default {
  data: () => ({
    cargando: false,
    nombreUsuario: "",
    id: null,
    bd: null,
  }),
  methods: {
    volver() {
      this.$router.push({ name: "Usuarios" });
    },
    async guardar() {
      updateDoc(doc(this.bd, "usuarios", this.id), {
        nombre: this.nombreUsuario,
      });
      this.volver();
    },
  },
  async mounted() {
    this.cargando = true;
    const id = this.$route.params.id;
    this.id = id;
    this.bd = await BaseDeDatosService.obtener();
    const instantaneaDocumento = await getDoc(doc(this.bd, "usuarios", id));
    if (instantaneaDocumento.exists()) {
      this.nombreUsuario = instantaneaDocumento.data().nombre;
    } else {
      this.$buefy.toast.open(
        "Error recuperando valor. Tal vez no se ha sincronizado la base de datos"
      );
    }
    this.cargando = false;
  },
};
</script>