<template>
  <div class="columns">
    <div class="column">
      <b-field label="Usuario">
        <b-input
          v-model="usuario"
          type="text"
          placeholder="Tu usuario"
          :loading="cargando"
        ></b-input
      ></b-field>
      <b-field label="Contraseña">
        <b-input
          v-model="palabraSecreta"
          type="password"
          placeholder="Tu contraseña"
          :loading="cargando"
        ></b-input
      ></b-field>
      <b-button :loading="cargando" class="is-success" @click="iniciarSesion()"
        >Iniciar sesión</b-button
      >
    </div>
  </div>
</template>
<script>
import BaseDeDatosService from "../../services/BaseDeDatosService";
import { query, getDocs, where, limit } from "firebase/firestore";
import { EventBus } from "../../EventBus";

const bcrypt = require("../../../node_modules/bcryptjs");
export default {
  data: () => ({
    usuario: "",
    palabraSecreta: "",
    cargando: false,
    coleccionUsuarios: null,
  }),
  async mounted() {
    const posibleUsuarioAutenticado =
      BaseDeDatosService.obtenerUsuarioAutenticado();
    if (posibleUsuarioAutenticado) {
      this.$router.push({ name: "ListaDeDeudas" });
      return;
    }
    this.coleccionUsuarios =
      await BaseDeDatosService.obtenerColeccionUsuarios();
  },
  methods: {
    async iniciarSesion() {
      if (!this.usuario || !this.palabraSecreta) {
        return;
      }

      this.cargando = true;
      const q = query(
        this.coleccionUsuarios,
        where("nombre", "==", this.usuario),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        this.$buefy.toast.open("Usuario o contraseña incorrectos");
        this.cargando = false;
        return;
      }
      const usuario = querySnapshot.docs[0].data();
      usuario.id = querySnapshot.docs[0].id;
      const palabraSecretaHasheada = usuario.palabraSecreta;
      const esValida = await bcrypt.compare(
        this.palabraSecreta,
        palabraSecretaHasheada
      );
      if (esValida) {
        BaseDeDatosService.guardarUsuarioAutenticado(usuario);
        EventBus.$emit("usuarioAutenticado", usuario);
        this.$buefy.toast.open("Bienvenido");
        this.$router.push({ name: "ListaDeDeudas" });
      } else {
        this.$buefy.toast.open("Usuario o contraseña incorrectos");
      }
      this.cargando = false;
    },
  },
};
</script>