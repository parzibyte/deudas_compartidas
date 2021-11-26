<template>
  <div>
    <b-navbar type="is-warning">
      <template #brand>
        <b-navbar-item>Deudas</b-navbar-item>
      </template>
      <template #start>
        <b-navbar-item
          v-show="usuarioAutenticado.nombre"
          tag="router-link"
          :to="{ name: 'Usuarios' }"
          ><b-icon icon="account-supervisor" class="mr-1"></b-icon>Usuarios
        </b-navbar-item>
        <b-navbar-item
          v-show="usuarioAutenticado.nombre"
          tag="router-link"
          :to="{ name: 'ListaDeDeudas' }"
          ><b-icon icon="currency-usd" class="mr-1"></b-icon>Deudas
        </b-navbar-item>
        <b-navbar-item
          v-show="usuarioAutenticado.nombre"
          tag="router-link"
          :to="{ name: 'AcercaDe' }"
          ><b-icon icon="information" class="mr-1"></b-icon>Acerca de
        </b-navbar-item>
      </template>
      <template #end>
        <a
          v-show="usuarioAutenticado.nombre"
          class="navbar-item"
          @click="cerrarSesion()"
        >
          Hola&nbsp; <strong>{{ usuarioAutenticado.nombre }}</strong
          >. ¿Cerrar sesión?
        </a>
      </template>
    </b-navbar>
    <section class="section">
      <router-view></router-view>
    </section>
    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          <strong>Control de deudas </strong>
          <b-icon icon="code-tags"></b-icon> con
          <b-icon icon="heart" type="is-danger"></b-icon> por
          <a href="https://parzibyte.me/blog">Parzibyte</a>
        </p>
      </div>
    </footer>
  </div>
</template>
<script>
import BaseDeDatosService from "./services/BaseDeDatosService";
import { EventBus } from "./EventBus";
export default {
  data: () => ({
    usuarioAutenticado: {},
  }),
  methods: {
    cerrarSesion() {
      BaseDeDatosService.guardarUsuarioAutenticado(null);
      this.usuarioAutenticado = {};
      this.$router.push({ name: "Login" });
    },
  },
  beforeMount() {
    EventBus.$on("usuarioAutenticado", (usuario) => {
      this.usuarioAutenticado = usuario;
    });
    const posibleUsuario = BaseDeDatosService.obtenerUsuarioAutenticado();
    if (posibleUsuario) {
      this.usuarioAutenticado = posibleUsuario;
    }
  },
};
</script>