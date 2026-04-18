/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    brand:   'main' | 'fruithai' | 'variegata'
    host:    string
    isAdmin: boolean
    isNgrok: boolean
  }
}
