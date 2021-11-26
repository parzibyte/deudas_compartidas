<template>
  <div class="columns">
    <div class="column">
      <h3 class="is-size-3">Agregar usuario</h3>
      <b-field label="Nombre">
        <b-input
          placeholder="Escribe el nombre"
          v-model="nombreUsuario"
          type="text"
        ></b-input
      ></b-field>
      <b-field label="Contraseña">
        <b-input
          placeholder="Escribe tu contraseña"
          v-model="palabraSecreta"
          type="password"
        ></b-input
      ></b-field>
      <b-field label="Vuelve a escribir tu contraseña">
        <b-input
          placeholder="Confirma tu contraseña"
          v-model="confirmacionPalabraSecreta"
          type="password"
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
import BaseDeDatosService from "../../services/BaseDeDatosService";
import { addDoc } from "firebase/firestore";
const bcrypt = require("../../../node_modules/bcryptjs");
export default {
  data: () => ({
    referenciaColeccionUsuarios: null,
    nombreUsuario: "",
    palabraSecreta: "",
    confirmacionPalabraSecreta: "",
    cargando: false,
  }),
  async mounted() {
    this.referenciaColeccionUsuarios =
      await BaseDeDatosService.obtenerColeccionUsuarios();
  },
  methods: {
    volver() {
      this.$router.push({ name: "Usuarios" });
    },
    async guardar() {
      if (
        !this.nombreUsuario ||
        !this.palabraSecreta ||
        !this.confirmacionPalabraSecreta
      ) {
        return;
      }
      if (this.palabraSecreta !== this.confirmacionPalabraSecreta) {
        this.$buefy.toast.open("Las contraseñas no coinciden");
        return;
      }
      this.cargando = true;
      const palabraSecreta = await bcrypt.hash(this.palabraSecreta, 10);
      addDoc(this.referenciaColeccionUsuarios, {
        nombre: this.nombreUsuario,
        palabraSecreta,
      });
      this.cargando = false;
      this.nombreUsuario = "";
      this.palabraSecreta = "";
      this.confirmacionPalabraSecreta = "";
      this.$buefy.toast.open("Guardado");
    },
  },
};
</script>