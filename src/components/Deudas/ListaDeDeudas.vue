<template>
  <div class="columns">
    <div class="column">
      <b-button
        :loading="cargando"
        @click="agregarDeuda()"
        class="is-success mb-5"
        icon-right="plus"
        >Nueva</b-button
      >
      <b-field label="Mostrar deudas donde el acreedor sea">
        <b-select
          @change.native="obtenerDeudasSegunFiltros()"
          placeholder="Selecciona un usuario"
          v-model="filtroDeudasAcreedor"
        >
          <option
            v-for="usuario in usuarios"
            :value="usuario"
            :key="usuario.id"
          >
            {{ usuario.nombre }}
          </option>
        </b-select>
      </b-field>
      <b-field label="Mostrar deudas donde el deudor sea">
        <b-select
          @change.native="obtenerDeudasSegunFiltros()"
          placeholder="Selecciona un usuario"
          v-model="filtroDeudasDeudor"
        >
          <option
            v-for="usuario in usuarios"
            :value="usuario"
            :key="usuario.id"
          >
            {{ usuario.nombre }}
          </option>
        </b-select>
      </b-field>
      <b-field label="Estado de liquidación">
        <b-select
          @change.native="obtenerDeudasSegunFiltros()"
          placeholder="Selecciona una opción"
          v-model="filtroEliminadas"
        >
          <option
            v-for="opcion in filtrosEliminadas"
            :value="opcion"
            :key="opcion.id"
          >
            {{ opcion }}
          </option>
        </b-select>
      </b-field>

      <hr />
      <table class="table is-bordered">
        <thead>
          <tr>
            <th>Estado</th>
            <th>Se liquida si</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(dato, indice) in totalesSimples()" :key="indice">
            <td>
              {{ dato.deudor.nombre }} le debe {{ dato.debe | dinero }} a
              {{ dato.acreedor.nombre }}; {{ dato.acreedor.nombre }} le debe
              {{ dato.leDeben | dinero }} a {{ dato.deudor.nombre }}
            </td>
            <td>
              <p v-if="dato.diferencia === 0">Ya está liquidado</p>
              <p v-else-if="dato.diferencia > 0">
                {{ dato.acreedor.nombre }} le da
                {{ (dato.leDeben - dato.debe) | dinero }} a
                {{ dato.deudor.nombre }}
              </p>
              <p v-else-if="dato.diferencia < 0">
                {{ dato.deudor.nombre }} le da
                {{ (dato.debe - dato.leDeben) | dinero }} a
                {{ dato.acreedor.nombre }}
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <b-table
        :data="deudas"
        :loading="cargando"
        :mobile-cards="true"
        hoverable
      >
        <b-table-column field="acreedor" label="Acreedor" v-slot="props">
          {{ detallesDeUsuario(props.row.acreedor).nombre }}
        </b-table-column>
        <b-table-column field="fecha" label="Fecha" v-slot="props">
          {{ props.row.fecha | fecha }}
        </b-table-column>
        <b-table-column field="descripcion" label="Descripción" v-slot="props">
          {{ props.row.descripcion }}
        </b-table-column>
        <b-table-column field="monto" label="Monto" v-slot="props">
          {{ props.row.monto | dinero }}
        </b-table-column>
        <b-table-column field="deudores" label="Deudores" v-slot="props">
          <ul>
            <li v-for="deudor in props.row.deudores" :key="deudor.id">
              <b-checkbox
                :disabled="
                  props.row.eliminada ||
                  usuarioAutenticado.id !== props.row.acreedor ||
                  deudor.pagado
                "
                @change.native="actualizarDeuda(props.row)"
                v-model="deudor.pagado"
                >{{ detallesDeUsuario(deudor.id).nombre }}
                {{ montoIndividual(props.row) | dinero }}</b-checkbox
              >
              <b-tag v-show="deudor.pagado" type="is-success">Pagado</b-tag>
            </li>
          </ul>
        </b-table-column>
        <b-table-column field="restante" label="Restante" v-slot="props">
          {{ restante(props.row) | dinero }}
        </b-table-column>
        <b-table-column field="id" label="Liquidar" v-slot="props">
          <b-button
            v-show="!props.row.eliminada"
            :disabled="usuarioAutenticado.id !== props.row.acreedor"
            type="is-info"
            @click="eliminar(props.row)"
          >
            <b-icon icon="check"></b-icon
          ></b-button>
          <b-tag v-show="props.row.eliminada" type="is-success"
            >Liquidada</b-tag
          >
        </b-table-column>
        <template #empty>
          <div class="has-text-centered">No hay registros</div>
        </template>
      </b-table>
    </div>
  </div>
</template>
<script>
const FILTRO_ELIMINADAS_Y_NO_ELIMINADAS = "Liquidadas y pendientes",
  FILTRO_ELIMINADAS = "Solo liquidadas",
  FILTRO_NO_ELIMINADAS = "Solo pendientes";
import BaseDeDatosService from "../../services/BaseDeDatosService";
import {
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
export default {
  data: () => ({
    usuarioAutenticado: {},
    filtrosEliminadas: [
      FILTRO_ELIMINADAS_Y_NO_ELIMINADAS,
      FILTRO_ELIMINADAS,
      FILTRO_NO_ELIMINADAS,
    ],
    filtroEliminadas: null,
    funcionParaDesuscribir: null,
    coleccionDeudas: null,
    bd: null,
    cargando: false,
    deudas: [],
    deudasFiltradas: [],
    diccionarioUsuarios: {},
    usuarios: [],
    referenciaListaDeudas: null,
    ID_TODOS_LOS_USUARIOS: "ID_TODOS_LOS_USUARIOS",
    filtroDeudasAcreedor: {},
    filtroDeudasDeudor: {},
  }),
  async mounted() {
    this.usuarioAutenticado = BaseDeDatosService.obtenerUsuarioAutenticado();
    this.filtroEliminadas = FILTRO_NO_ELIMINADAS;
    await this.obtenerUsuarios();
    this.coleccionDeudas = await BaseDeDatosService.obtenerColeccionDeudas();
    this.bd = await BaseDeDatosService.obtener();
    this.obtenerDeudasSegunFiltros();
  },
  methods: {
    obtenerDeudasSegunFiltros() {
      this.deudas = [];
      if (typeof this.funcionParaDesuscribir === "function") {
        this.funcionParaDesuscribir();
      }
      const restriccionesConsulta = [orderBy("fecha", "desc")];
      if (this.filtroEliminadas === FILTRO_ELIMINADAS) {
        restriccionesConsulta.push(where("eliminada", "==", true));
      } else if (this.filtroEliminadas === FILTRO_NO_ELIMINADAS) {
        restriccionesConsulta.push(where("eliminada", "==", false));
      }
      if (this.filtroDeudasAcreedor.id !== this.ID_TODOS_LOS_USUARIOS) {
        restriccionesConsulta.push(
          where("acreedor", "==", this.filtroDeudasAcreedor.id)
        );
      }
      if (this.filtroDeudasDeudor.id !== this.ID_TODOS_LOS_USUARIOS) {
        restriccionesConsulta.push(
          where("idDeudores", "array-contains", this.filtroDeudasDeudor.id)
        );
      }
      const consulta = query(this.coleccionDeudas, ...restriccionesConsulta);
      this.funcionParaDesuscribir = onSnapshot(
        consulta,
        this.manejarEventoSnapshot
      );
    },
    manejarEventoSnapshot(instantanea) {
      this.cargando = true;
      instantanea.docChanges().forEach((cambio) => {
        const deuda = cambio.doc.data();
        const idDeuda = cambio.doc.id;
        if (cambio.type === "added") {
          deuda.id = idDeuda;
          this.deudas.push(deuda);
        }
        if (cambio.type === "modified") {
          const indice = this.indiceDeDeuda(idDeuda);
          if (indice !== -1) {
            this.$set(this.deudas, indice, deuda);
          }
        }
        if (cambio.type === "removed") {
          const indice = this.indiceDeDeuda(idDeuda);
          if (indice !== -1) {
            this.deudas.splice(indice, 1);
          }
        }
      });
      this.cargando = false;
    },
    eliminar(deuda) {
      this.$buefy.dialog.confirm({
        message: `¿Liquidar deuda? Esto no se puede deshacer`,
        cancelText: "Cancelar",
        confirmText: "Sí, liquidar",
        onConfirm: async () => {
          this.cargando = true;
          deuda.eliminada = true;
          updateDoc(doc(this.bd, "deudas", deuda.id), deuda);
          this.$buefy.toast.open("Liquidada");
          this.cargando = false;
        },
      });
    },
    indiceDeDeuda(idDeuda) {
      return this.deudas.findIndex((deuda) => deuda.id === idDeuda);
    },
    async actualizarDeuda(deuda) {
      updateDoc(doc(this.bd, "deudas", deuda.id), deuda);
    },
    totalesSimples() {
      const totales = {};
      for (const deuda of this.deudas) {
        if (!totales[deuda.acreedor]) {
          totales[deuda.acreedor] = {
            acreedor: this.detallesDeUsuario(deuda.acreedor),
            deudores: {},
          };
        }
        for (const deudor of deuda.deudores) {
          if (deuda.acreedor !== deudor.id) {
            if (!totales[deuda.acreedor]["deudores"][deudor.id]) {
              totales[deuda.acreedor]["deudores"][deudor.id] = {
                deudor: this.detallesDeUsuario(deudor.id),
                debe: 0,
                leDeben: 0,
                diferencia: 0,
              };
            }

            if (!totales[deudor.id]) {
              totales[deudor.id] = {
                acreedor: this.detallesDeUsuario(deudor.id),
                deudores: {},
              };
            }
            if (!totales[deudor.id]["deudores"][deuda.acreedor]) {
              totales[deudor.id]["deudores"][deuda.acreedor] = {
                deudor: this.detallesDeUsuario(deuda.acreedor),
                debe: 0,
                leDeben: 0,
                diferencia: 0,
              };
            }
            if (!deudor.pagado && !deuda.eliminada) {
              const montoIndividual = this.montoIndividual(deuda);
              totales[deudor.id]["deudores"][deuda.acreedor].leDeben +=
                montoIndividual;
              totales[deudor.id]["deudores"][deuda.acreedor].diferencia +=
                montoIndividual;
              totales[deuda.acreedor]["deudores"][deudor.id].debe +=
                montoIndividual;
              totales[deuda.acreedor]["deudores"][deudor.id].diferencia -=
                montoIndividual;
            }
          }
        }
      }
      // Remover repetidos
      for (const [clave, valor] of Object.entries(totales)) {
        for (const [claveDeudor] of Object.entries(valor.deudores)) {
          if (
            totales[clave].deudores[claveDeudor] &&
            totales[claveDeudor].deudores[clave]
          ) {
            delete totales[claveDeudor].deudores[clave];
          }
        }
      }

      // Remover vacíos
      for (const [clave] of Object.entries(totales)) {
        if (Object.keys(totales[clave].deudores).length === 0) {
          delete totales[clave];
        }
      }
      const otrosTotales = [];

      for (const [, valor] of Object.entries(totales)) {
        for (const [, otroValor] of Object.entries(valor.deudores)) {
          otrosTotales.push({
            acreedor: valor.acreedor,
            deudor: otroValor.deudor,
            debe: otroValor.debe,
            leDeben: otroValor.leDeben,
            diferencia: otroValor.diferencia,
          });
        }
      }
      return otrosTotales;
    },
    desglose() {
      const deudores = {};

      for (const deuda of this.deudas) {
        for (const deudor of deuda.deudores) {
          if (!deudores[deudor.id]) {
            deudores[deudor.id] = { deudor, monto: 0 };
          }
          if (!deudor.pagado && !deuda.eliminada) {
            deudores[deudor.id].monto += this.montoIndividual(deuda);
          }
        }
      }
      return deudores;
    },
    totalDeuda() {
      let total = 0;
      for (const deuda of this.deudas) {
        if (!deuda.eliminada) {
          total += this.restante(deuda);
        }
      }
      return total;
    },
    montoIndividual(deuda) {
      if (deuda.eliminada) {
        return 0;
      }
      if (deuda.deudores.length <= 0) {
        return 0;
      }
      return deuda.monto / deuda.deudores.length;
    },
    restante(deuda) {
      if (deuda.eliminada) {
        return 0;
      }
      let usuariosQueNoHanPagado = 0;
      for (const deudor of deuda.deudores) {
        if (!deudor.pagado) {
          usuariosQueNoHanPagado++;
        }
      }
      return this.montoIndividual(deuda) * usuariosQueNoHanPagado;
    },
    detallesDeUsuario(id) {
      return this.diccionarioUsuarios[id] || {};
    },
    agregarDeuda() {
      this.$router.push({ name: "AgregarDeuda" });
    },
    async obtenerUsuarios() {
      this.cargando = true;
      const instantanea = await BaseDeDatosService.obtenerUsuarios();
      this.diccionarioUsuarios = {};
      this.usuarios = [
        { id: this.ID_TODOS_LOS_USUARIOS, nombre: "-- Todos --" },
      ];
      this.filtroDeudasDeudor = this.usuarios[0];
      this.filtroDeudasAcreedor = this.usuarios[0];
      instantanea.forEach((datoInstantanea) => {
        this.diccionarioUsuarios[datoInstantanea.id] = datoInstantanea.data();
        const usuario = {
          id: datoInstantanea.id,
          nombre: datoInstantanea.data().nombre,
        };
        this.usuarios.push(usuario);
      });
      this.cargando = false;
    },
  },
};
</script>