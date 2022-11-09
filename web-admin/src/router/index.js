import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from "@/pages/Index";
import Users from "@/pages/Users";
import User from "@/pages/User";
import Items from "@/pages/Items";
import Withdraws from "@/pages/Withdraws";
import Settings from "@/pages/Settings";
import Bots from "@/pages/Bots";
import Payments from "@/pages/Payments";
import Promocodes from "@/pages/Promocodes";
import Tickets from "@/pages/Tickets";
import Ticket from "@/pages/Ticket";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'index',
    component: Index
  },
  {
    path: '/users',
    name: 'users',
    component: Users
  },
  {
    path: '/user/:id',
    name: 'user',
    component: User
  },
  {
    path: '/items',
    name: 'items',
    component: Items
  },
  {
    path: '/withdraws',
    name: 'withdraws',
    component: Withdraws
  },
  {
    path: '/bots',
    name: 'bots',
    component: Bots
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings
  },
  {
    path: '/payments',
    name: 'payments',
    component: Payments
  },
  {
    path: '/promocodes',
    name: 'promocodes',
    component: Promocodes
  },
  {
    path: '/tickets',
    name: 'tickets',
    component: Tickets
  },
  {
    path: '/ticket/:id',
    name: 'ticket',
    component: Ticket
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router