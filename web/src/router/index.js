import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import History from '../views/History.vue'
import Support from '../views/Support.vue'
import Profile from '../views/Profile/Profile.vue'
import Game from "@/views/Game"
import User from "@/views/User"
import AuthCallback from '@/views/Auth-callback'
import Referral from '@/views/Referral'
import Coinflip from "@/views/Coinflip"
import Wheel from '@/views/Wheel'
import Tickets from '@/views/Tickets'
import CreateTickets from '@/views/CreateTickets'
import Ticket from '@/views/Ticket'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/coinflip',
    name: 'Coinflip',
    component: Coinflip
  },
  {
    path: '/wheel',
    name: 'Wheel',
    component: Wheel
  },
  {
    path: '/history',
    name: 'History',
    component: History
  },
  {
    path: '/support',
    name: 'Support',
    component: Support
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User
  },
  {
    path: '/game/:id',
    name: 'Game',
    component: Game
  },
  {
    path: '/auth/steam',
    name: 'AuthCallback',
    component: AuthCallback
  },
  {
    path: '/r/:ref',
    name: 'Referral',
    component: Referral
  },
  {
    path: '/tickets',
    name: 'Tickets',
    component: Tickets
  },
  {
    path: '/tickets/create',
    name: 'CreateTickets',
    component: CreateTickets
  },
  {
    path: '/ticket/:id',
    name: 'Ticket',
    component: Ticket
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
