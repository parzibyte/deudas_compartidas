<template>
  <div class="columns">
    <div class="column">
      <h3 class="is-size-3">Agregar deuda</h3>
      <b-field
        message="La persona que hizo la compra, a la que le van a pagar"
        label="Acreedor"
      >
        <b-select
          :loading="cargando"
          placeholder="Seleccione un usuario"
          v-model="acreedor"
        >
          <option
            v-for="usuario in usuarios"
            :value="usuario"
            :disabled="usuarioAutenticado.id !== usuario.id"
            :key="usuario.id"
          >
            {{ usuario.nombre }}
          </option>
        </b-select>
      </b-field>
      <b-field label="Descripción">
        <b-input
          :loading="cargando"
          v-model="descripcion"
          placeholder="Escribe la descripción"
        ></b-input>
      </b-field>
      <b-field label="Monto">
        <b-input
          :loading="cargando"
          v-model.number="monto"
          type="number"
          step="0.1"
          placeholder="Escribe el monto"
        ></b-input>
      </b-field>
      <b-field label="Deudores (los que pagarán la deuda)">
        <b-checkbox
          :loading="cargando"
          :disabled="deberiaDeshabilitarUsuario()"
          v-model="deudor.seleccionado"
          v-for="deudor in deudores"
          :key="deudor.id"
        >
          {{ deudor.nombre }}
        </b-checkbox>
      </b-field>
      <b-button
        @click="volver()"
        :loading="cargando"
        class="is-info"
        icon-left="arrow-left"
        >Volver</b-button
      >
      &nbsp;
      <b-button
        :disabled="deberiaDeshabilitarBotonGuardar()"
        :loading="cargando"
        type="is-success"
        @click="guardar()"
        >Guardar</b-button
      >
    </div>
  </div>
</template>
<script>
import BaseDeDatosService from "../../services/BaseDeDatosService";
import { addDoc } from "firebase/firestore";
export default {
  data: () => ({
    acreedor: null,
    descripcion: "",
    monto: null,
    usuarios: [],
    deudores: [],
    cargando: false,
    referenciaListaDeudas: null,
    coleccionDeudas: null,
    usuarioAutenticado: {},
  }),
  async mounted() {
    this.usuarioAutenticado = BaseDeDatosService.obtenerUsuarioAutenticado();
    this.coleccionDeudas = await BaseDeDatosService.obtenerColeccionDeudas();
    this.obtenerUsuarios();
  },
  methods: {
    volver() {
      this.$router.push({ name: "ListaDeDeudas" });
    },
    async guardar() {
      if (!this.acreedor) {
        return;
      }
      const deuda = {
        eliminada: false,
        acreedor: this.acreedor.id,
        idDeudores: this.deudores
          .filter((deudor) => deudor.seleccionado)
          .map((deudor) => deudor.id),
        deudores: this.deudores
          .filter((deudor) => deudor.seleccionado)
          .map((deudor) => {
            return {
              id: deudor.id,
              pagado: false,
            };
          }),
        monto: this.monto,
        descripcion: this.descripcion,
        fecha: new Date().getTime(),
      };
      this.cargando = true;
      addDoc(this.coleccionDeudas, deuda);
      this.$buefy.toast.open("Guardada");
      this.cargando = false;
      this.descripcion = "";
      this.monto = null;
      this.acreedor = null;
      for (const deudor of this.deudores) {
        deudor.seleccionado = false;
      }
    },
    deberiaDeshabilitarBotonGuardar() {
      if (!this.acreedor || !this.monto || !this.descripcion) {
        return true;
      }
      if (this.deudores.every((deudor) => !deudor.seleccionado)) {
        return true;
      }
      return false;
    },
    deberiaDeshabilitarUsuario() {
      // Cuando no hay acreedor, deshabilitamos todo
      if (!this.acreedor) {
        return true;
      }
      return false;
    },
    async obtenerUsuarios() {
      this.cargando = true;
      const instantanea = await BaseDeDatosService.obtenerUsuarios();
      this.usuarios = [];
      this.deudores = [];
      instantanea.forEach((datoInstantanea) => {
        const usuario = {
          id: datoInstantanea.id,
          nombre: datoInstantanea.data().nombre,
        };
        this.usuarios.push(usuario);
        this.deudores.push(usuario);
      });
      this.cargando = false;
    },
  },
};
</script>