interface ServiceDefinition {
  resolver: () => any
  singleton: boolean
  instance?: any
}

class Container {
  private services = new Map<string, ServiceDefinition>()

  bind(name: string, resolver: () => any): void {
    this.services.set(name, { resolver, singleton: false })
  }

  singleton(name: string, resolver: () => any): void {
    this.services.set(name, { resolver, singleton: true })
  }

  resolve<T>(name: string): T {
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Service ${name} not found`)
    }

    if (service.singleton && !service.instance) {
      service.instance = service.resolver()
    }

    return (service.singleton ? service.instance : service.resolver()) as T
  }
}
