
<script setup>
import { ref, computed, onMounted } from 'vue'

const API = 'http://localhost:3000/equipos'

const equipos = ref([])
const cargando = ref(true)
const error = ref('')
const mensaje = ref('')
const busqueda = ref('')
const filtroTipo = ref('')
const filtroUbicacion = ref('')
const filtroEstado = ref('')

const mostrarFormulario = ref(false)
const equipoEditando = ref(null)
const equipoDetalle = ref(null)
const guardando = ref(false)
const errorFormulario = ref('')

function formularioVacio() {
  return {
    codigoInventario: '',
    nombre: '',
    tipo: '',
    marca: '',
    modelo: '',
    ubicacion: '',
    estado: 'Disponible',
    fechaAdquisicion: '',
    observaciones: '',
  }
}

const formulario = ref(formularioVacio())

async function cargarEquipos() {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await fetch(API)

    if (!respuesta.ok) {
      throw new Error('No se pudieron cargar los equipos')
    }

    equipos.value = await respuesta.json()
  } catch (e) {
    error.value =
      'No se pudo conectar con el servidor. Comprueba que NestJS esté funcionando.'
  } finally {
    cargando.value = false
  }
}

const equiposFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()

  return equipos.value.filter((equipo) => {
    const coincideTexto =
      (equipo.nombre || '').toLowerCase().includes(texto) ||
      (equipo.codigoInventario || '').toLowerCase().includes(texto)

    return (
      coincideTexto &&
      (!filtroTipo.value || equipo.tipo === filtroTipo.value) &&
      (!filtroUbicacion.value ||
        equipo.ubicacion === filtroUbicacion.value) &&
      (!filtroEstado.value || equipo.estado === filtroEstado.value)
    )
  })
})

const tipos = computed(() =>
  [...new Set(equipos.value.map((e) => e.tipo).filter(Boolean))],
)

const ubicaciones = computed(() =>
  [...new Set(equipos.value.map((e) => e.ubicacion).filter(Boolean))],
)

function limpiarFiltros() {
  busqueda.value = ''
  filtroTipo.value = ''
  filtroUbicacion.value = ''
  filtroEstado.value = ''
}

function nuevoEquipo() {
  equipoEditando.value = null
  formulario.value = formularioVacio()
  errorFormulario.value = ''
  mensaje.value = ''
  mostrarFormulario.value = true
  equipoDetalle.value = null
}

function editarEquipo(equipo) {
  equipoEditando.value = equipo.id

  formulario.value = {
    codigoInventario: equipo.codigoInventario || '',
    nombre: equipo.nombre || '',
    tipo: equipo.tipo || '',
    marca: equipo.marca || '',
    modelo: equipo.modelo || '',
    ubicacion: equipo.ubicacion || '',
    estado: equipo.estado || 'Disponible',
    fechaAdquisicion: String(equipo.fechaAdquisicion || '').slice(0, 10),
    observaciones: equipo.observaciones || '',
  }

  errorFormulario.value = ''
  mensaje.value = ''
  mostrarFormulario.value = true
  equipoDetalle.value = null
}

function cerrarFormulario() {
  mostrarFormulario.value = false
  equipoEditando.value = null
  errorFormulario.value = ''
}

async function guardarEquipo() {
  guardando.value = true
  errorFormulario.value = ''
  mensaje.value = ''

  const datos = {
    ...formulario.value,
    codigoInventario: formulario.value.codigoInventario.trim(),
    nombre: formulario.value.nombre.trim(),
    tipo: formulario.value.tipo.trim(),
    marca: formulario.value.marca.trim(),
    modelo: formulario.value.modelo.trim(),
    ubicacion: formulario.value.ubicacion.trim(),
    observaciones: formulario.value.observaciones.trim(),
  }

  const editando = equipoEditando.value !== null
  const url = editando ? `${API}/${equipoEditando.value}` : API

  try {
    const respuesta = await fetch(url, {
      method: editando ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    })

    const resultado = await respuesta.json().catch(() => null)

    if (!respuesta.ok) {
      const detalle = Array.isArray(resultado?.message)
        ? resultado.message.join('. ')
        : resultado?.message || 'No se pudo guardar el equipo.'

      throw new Error(detalle)
    }

    cerrarFormulario()
    mensaje.value = editando
      ? 'Equipo actualizado correctamente.'
      : 'Equipo registrado correctamente.'

    await cargarEquipos()
  } catch (e) {
    errorFormulario.value =
      e.message || 'Ocurrió un error al guardar el equipo.'
  } finally {
    guardando.value = false
  }
}

async function verDetalle(equipo) {
  error.value = ''

  try {
    const respuesta = await fetch(`${API}/${equipo.id}`)

    if (!respuesta.ok) {
      throw new Error('No se pudo consultar el equipo.')
    }

    equipoDetalle.value = await respuesta.json()
    mostrarFormulario.value = false
  } catch (e) {
    error.value = e.message
  }
}

function cerrarDetalle() {
  equipoDetalle.value = null
}

async function eliminarEquipo(equipo) {
  const confirmar = window.confirm(
    `¿Seguro que deseas eliminar el equipo "${equipo.nombre}"?`,
  )

  if (!confirmar) return

  mensaje.value = ''
  error.value = ''

  try {
    const respuesta = await fetch(`${API}/${equipo.id}`, {
      method: 'DELETE',
    })

    if (!respuesta.ok) {
      const resultado = await respuesta.json().catch(() => null)
      throw new Error(resultado?.message || 'No se pudo eliminar el equipo.')
    }

    if (equipoDetalle.value?.id === equipo.id) {
      equipoDetalle.value = null
    }

    mensaje.value = 'Equipo eliminado correctamente.'
    await cargarEquipos()
  } catch (e) {
    error.value = e.message
  }
}

onMounted(cargarEquipos)
</script>

<template>
  <main class="contenedor">
    <header class="encabezado">
      <div>
        <p class="subtitulo">ADMINISTRACIÓN</p>
        <h1>Inventario tecnológico</h1>
        <p class="descripcion">
          Gestiona los equipos tecnológicos de tu organización.
        </p>
      </div>

      <div class="botones-encabezado">
        <button class="boton-principal" @click="nuevoEquipo">
          + Registrar equipo
        </button>
        <button class="boton-actualizar" @click="cargarEquipos">
          Actualizar listado
        </button>
      </div>
    </header>

    <p v-if="mensaje" class="alerta-exito" role="status">
      {{ mensaje }}
    </p>

    <p v-if="error" class="alerta-error" role="alert">
      {{ error }}
    </p>

    <section class="resumen">
      <div class="tarjeta">
        <span>Total de equipos</span>
        <strong>{{ equipos.length }}</strong>
      </div>
      <div class="tarjeta">
        <span>Disponibles</span>
        <strong>{{ equipos.filter(e => e.estado === 'Disponible').length }}</strong>
      </div>
      <div class="tarjeta">
        <span>En uso</span>
        <strong>{{ equipos.filter(e => e.estado === 'En uso').length }}</strong>
      </div>
      <div class="tarjeta">
        <span>En mantención</span>
        <strong>{{ equipos.filter(e => e.estado === 'Mantención').length }}</strong>
      </div>
    </section>

    <section v-if="mostrarFormulario" class="panel formulario-panel">
      <div class="panel-encabezado">
        <div>
          <h2>{{ equipoEditando !== null ? 'Editar equipo' : 'Registrar equipo' }}</h2>
          <p class="ayuda">Completa los datos del equipo tecnológico.</p>
        </div>
        <button class="boton-secundario" type="button" @click="cerrarFormulario">
          Cerrar
        </button>
      </div>

      <form class="formulario" @submit.prevent="guardarEquipo">
        <label>
          Código de inventario *
          <input
            v-model="formulario.codigoInventario"
            required
            minlength="3"
            maxlength="50"
            placeholder="Ej. EQ-001"
          />
        </label>

        <label>
          Nombre *
          <input
            v-model="formulario.nombre"
            required
            minlength="3"
            maxlength="100"
            placeholder="Ej. Notebook administrativo"
          />
        </label>

        <label>
          Tipo *
          <input
            v-model="formulario.tipo"
            required
            minlength="3"
            maxlength="100"
            placeholder="Ej. Computador"
          />
        </label>

        <label>
          Marca
          <input v-model="formulario.marca" maxlength="100" placeholder="Ej. Lenovo" />
        </label>

        <label>
          Modelo
          <input v-model="formulario.modelo" maxlength="100" placeholder="Ej. ThinkPad" />
        </label>

        <label>
          Ubicación
          <input v-model="formulario.ubicacion" maxlength="150" placeholder="Ej. Oficina principal" />
        </label>

        <label>
          Estado *
          <select v-model="formulario.estado" required>
            <option value="Disponible">Disponible</option>
            <option value="En uso">En uso</option>
            <option value="Mantención">Mantención</option>
            <option value="Baja">Baja</option>
          </select>
        </label>

        <label>
          Fecha de adquisición *
          <input v-model="formulario.fechaAdquisicion" type="date" required />
        </label>

        <label class="campo-completo">
          Observaciones
          <textarea
            v-model="formulario.observaciones"
            rows="3"
            placeholder="Información adicional del equipo..."
          ></textarea>
        </label>

        <p v-if="errorFormulario" class="alerta-error campo-completo" role="alert">
          {{ errorFormulario }}
        </p>

        <div class="acciones-formulario campo-completo">
          <button class="boton-secundario" type="button" @click="cerrarFormulario">
            Cancelar
          </button>
          <button class="boton-principal" type="submit" :disabled="guardando">
            {{ guardando ? 'Guardando...' : equipoEditando !== null ? 'Guardar cambios' : 'Registrar equipo' }}
          </button>
        </div>
      </form>
    </section>

    <section v-if="equipoDetalle" class="panel detalle-panel">
      <div class="panel-encabezado">
        <div>
          <h2>Detalle del equipo</h2>
          <p class="ayuda">Información completa del registro seleccionado.</p>
        </div>
        <button class="boton-secundario" @click="cerrarDetalle">Cerrar detalle</button>
      </div>

      <div class="detalle-grid">
        <p><strong>Código:</strong> {{ equipoDetalle.codigoInventario }}</p>
        <p><strong>Nombre:</strong> {{ equipoDetalle.nombre }}</p>
        <p><strong>Tipo:</strong> {{ equipoDetalle.tipo }}</p>
        <p><strong>Marca:</strong> {{ equipoDetalle.marca || 'Sin marca' }}</p>
        <p><strong>Modelo:</strong> {{ equipoDetalle.modelo || 'Sin modelo' }}</p>
        <p><strong>Ubicación:</strong> {{ equipoDetalle.ubicacion || 'Sin ubicación' }}</p>
        <p><strong>Estado:</strong> {{ equipoDetalle.estado }}</p>
        <p><strong>Fecha de adquisición:</strong> {{ String(equipoDetalle.fechaAdquisicion || '').slice(0, 10) }}</p>
        <p class="campo-completo"><strong>Observaciones:</strong> {{ equipoDetalle.observaciones || 'Sin observaciones' }}</p>
      </div>
    </section>

    <section class="panel">
      <div class="panel-encabezado">
        <div>
          <h2>Equipos registrados</h2>
          <p class="ayuda">Busca y filtra los equipos del inventario.</p>
        </div>
        <span class="contador">{{ equiposFiltrados.length }} resultados</span>
      </div>

      <div class="filtros">
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre o código..."
          aria-label="Buscar por nombre o código"
        />

        <select v-model="filtroTipo" aria-label="Filtrar por tipo">
          <option value="">Todos los tipos</option>
          <option v-for="tipo in tipos" :key="tipo" :value="tipo">
            {{ tipo }}
          </option>
        </select>

        <select v-model="filtroUbicacion" aria-label="Filtrar por ubicación">
          <option value="">Todas las ubicaciones</option>
          <option v-for="ubicacion in ubicaciones" :key="ubicacion" :value="ubicacion">
            {{ ubicacion }}
          </option>
        </select>

        <select v-model="filtroEstado" aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="En uso">En uso</option>
          <option value="Mantención">Mantención</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      <div class="acciones-filtros">
        <button class="boton-secundario" @click="limpiarFiltros">
          Limpiar filtros
        </button>
      </div>

      <p v-if="cargando" class="mensaje">Cargando equipos...</p>

      <div v-else-if="error && equipos.length === 0" class="vacio">
        <h3>No se pudieron cargar los equipos</h3>
        <p>{{ error }}</p>
        <button class="boton-principal" @click="cargarEquipos">Reintentar</button>
      </div>

      <div v-else-if="equipos.length === 0" class="vacio">
        <h3>No hay equipos registrados</h3>
        <p>Registra un equipo para comenzar a llenar el inventario.</p>
        <button class="boton-principal" @click="nuevoEquipo">
          Registrar primer equipo
        </button>
      </div>

      <div v-else-if="equiposFiltrados.length === 0" class="vacio">
        <h3>No se encontraron resultados</h3>
        <p>Prueba con otro texto o cambia los filtros.</p>
      </div>

      <div v-else class="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Marca</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="equipo in equiposFiltrados" :key="equipo.id">
              <td class="codigo">{{ equipo.codigoInventario }}</td>
              <td>{{ equipo.nombre }}</td>
              <td>{{ equipo.tipo }}</td>
              <td>{{ equipo.marca || 'Sin marca' }}</td>
              <td>{{ equipo.ubicacion || 'Sin ubicación' }}</td>
              <td>
                <span
                  class="estado"
                  :class="{
                    disponible: equipo.estado === 'Disponible',
                    enUso: equipo.estado === 'En uso',
                    mantencion: equipo.estado === 'Mantención',
                    baja: equipo.estado === 'Baja',
                  }"
                >
                  {{ equipo.estado }}
                </span>
              </td>
              <td>
                <div class="acciones-tabla">
                  <button class="boton-tabla" @click="verDetalle(equipo)">Ver</button>
                  <button class="boton-tabla" @click="editarEquipo(equipo)">Editar</button>
                  <button class="boton-eliminar" @click="eliminarEquipo(equipo)">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <footer>Sistema de Inventario Tecnológico · Evaluación 2</footer>
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f3f5f9;
  color: #202b3c;
  font-family: Arial, Helvetica, sans-serif;
}

button, input, select, textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.contenedor {
  max-width: 1250px;
  margin: 0 auto;
  padding: 40px 24px;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.botones-encabezado {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.subtitulo {
  color: #3569c8;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 2px;
}

h1 {
  margin: 8px 0;
  font-size: 32px;
}

.descripcion, .ayuda {
  color: #697586;
}

.descripcion {
  margin-bottom: 0;
}

.boton-principal, .boton-actualizar {
  background: #3569c8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 18px;
}

.boton-principal:hover, .boton-actualizar:hover {
  background: #2855a5;
}

.resumen {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.tarjeta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: white;
  border: 1px solid #e1e6ee;
  border-radius: 12px;
}

.tarjeta span {
  color: #697586;
  font-size: 14px;
}

.tarjeta strong {
  font-size: 28px;
}

.panel {
  background: white;
  border: 1px solid #e1e6ee;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 22px;
  box-shadow: 0 4px 16px #1e293b08;
}

.panel-encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 22px;
}

.panel-encabezado h2 {
  margin: 0;
  font-size: 20px;
}

.ayuda {
  margin: 8px 0 0;
  font-size: 14px;
}

.contador {
  background: #edf3ff;
  color: #3569c8;
  border-radius: 20px;
  padding: 7px 12px;
  font-size: 13px;
  white-space: nowrap;
}

.filtros {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
}

.filtros input, .filtros select, .formulario input, .formulario select,
.formulario textarea {
  min-width: 0;
  width: 100%;
  padding: 11px;
  border: 1px solid #d7deea;
  border-radius: 8px;
  background: white;
  color: #202b3c;
}

.filtros input:focus, .filtros select:focus, .formulario input:focus,
.formulario select:focus, .formulario textarea:focus {
  outline: 2px solid #b8cdf7;
  border-color: #3569c8;
}

.acciones-filtros {
  display: flex;
  justify-content: flex-end;
  margin: 12px 0 20px;
}

.boton-secundario {
  background: white;
  color: #3569c8;
  border: 1px solid #d7deea;
  border-radius: 8px;
  padding: 9px 13px;
}

.boton-secundario:hover {
  background: #f3f6fc;
}

.formulario {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.formulario label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #344054;
  font-size: 14px;
  font-weight: 600;
}

.campo-completo {
  grid-column: 1 / -1;
}

.formulario textarea {
  resize: vertical;
}

.acciones-formulario {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.alerta-exito, .alerta-error {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 18px;
}

.alerta-exito {
  color: #247641;
  background: #e8f7ed;
  border: 1px solid #bce6c8;
}

.alerta-error {
  color: #b42318;
  background: #fdebea;
  border: 1px solid #f5c2c0;
}

.mensaje, .vacio {
  padding: 32px 12px;
  text-align: center;
  color: #697586;
}

.vacio h3 {
  color: #202b3c;
}

.vacio p {
  margin-bottom: 18px;
}

.tabla-contenedor {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 15px 12px;
  border-bottom: 1px solid #e8edf3;
  white-space: nowrap;
}

th {
  color: #697586;
  font-size: 12px;
  text-transform: uppercase;
}

tbody tr:hover {
  background: #f8faff;
}

.codigo {
  color: #3569c8;
  font-weight: bold;
}

.estado {
  display: inline-block;
  border-radius: 20px;
  padding: 6px 10px;
  font-size: 12px;
}

.disponible {
  background: #e8f7ed;
  color: #247641;
}

.enUso {
  background: #edf3ff;
  color: #2855a5;
}

.mantencion {
  background: #fff4db;
  color: #8a5a00;
}

.baja {
  background: #fdebea;
  color: #b42318;
}

.acciones-tabla {
  display: flex;
  gap: 6px;
}

.boton-tabla, .boton-eliminar {
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid #d7deea;
  background: white;
  color: #3569c8;
}

.boton-tabla:hover {
  background: #edf3ff;
}

.boton-eliminar {
  color: #b42318;
  border-color: #f1c6c3;
}

.boton-eliminar:hover {
  background: #fdebea;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 24px;
}

.detalle-grid p {
  padding: 10px;
  margin: 0;
  border-bottom: 1px solid #e8edf3;
  overflow-wrap: anywhere;
}

footer {
  margin-top: 24px;
  color: #8791a0;
  text-align: center;
  font-size: 12px;
}

@media (max-width: 900px) {
  .resumen {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filtros {
    grid-template-columns: 1fr 1fr;
  }

  .encabezado {
    align-items: flex-start;
  }
}

@media (max-width: 600px) {
  .contenedor {
    padding: 24px 14px;
  }

  .encabezado {
    flex-direction: column;
  }

  .botones-encabezado {
    width: 100%;
  }

  h1 {
    font-size: 26px;
  }

  .panel {
    padding: 16px;
  }

  .panel-encabezado {
    align-items: flex-start;
    flex-direction: column;
  }

  .filtros, .formulario, .detalle-grid {
    grid-template-columns: 1fr;
  }

  .campo-completo {
    grid-column: auto;
  }

  .acciones-formulario {
    flex-direction: column-reverse;
  }
}
</style>
