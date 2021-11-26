import Vue from 'vue'
import Router from 'vue-router'
import ListaDeUsuarios from '@/components/Usuarios/ListaDeUsuarios'
import AgregarUsuario from '@/components/Usuarios/AgregarUsuario'
import EditarUsuario from '@/components/Usuarios/EditarUsuario'
import AgregarDeuda from '@/components/Deudas/AgregarDeuda'
import ListaDeDeudas from '@/components/Deudas/ListaDeDeudas'
import AcercaDe from '@/components/AcercaDe'
import Login from '@/components/Usuarios/Login'
import BaseDeDatosService from './services/BaseDeDatosService'

Vue.use(Router);

const router = new Router({
	routes: [
		{
			path: '/',
			redirect: '/deudas'
		},
		{
			path: '/usuarios',
			name: 'Usuarios',
			component: ListaDeUsuarios,
		},
		{
			path: '/agregar-usuario',
			name: 'AgregarUsuario',
			component: AgregarUsuario,
		},
		{
			path: '/editar-usuario/:id',
			name: 'EditarUsuario',
			component: EditarUsuario,
		},
		{
			path: '/agregar-deuda',
			name: 'AgregarDeuda',
			component: AgregarDeuda,
		},
		{
			path: '/deudas',
			name: 'ListaDeDeudas',
			component: ListaDeDeudas,
		},
		{
			path: '/acerca-de',
			name: 'AcercaDe',
			component: AcercaDe,
		},
		{
			path: '/login',
			name: 'Login',
			component: Login,
		},
	]
});
router.beforeEach((haciaDonde, desdeDonde, siguiente) => {
	if (!BaseDeDatosService.obtenerUsuarioAutenticado() && haciaDonde.name !== "Login") {
		siguiente({ name: "Login" });
	} else {
		siguiente();
	}
});
export default router;