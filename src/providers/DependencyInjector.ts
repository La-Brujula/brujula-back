import { Container } from "typedi";
import Logger from "./Logger";

class DependencyInjector {
  private models: { name: string; model: any }[] = [];

  init(): void {
    try {
      this.loadModels();
      this.models.forEach((m) => {
        Container.set(m.name, m.model);
      });
      Container.set("logger", Logger);
    } catch (err) {
      console.log("Failed loading dependency injection");
      throw err;
    }
  }

  loadModels(): void {
    // this.models.push({
    //   name: "userModel",
    //   model: require("../database/mongodb/schemas/UserSchema").default,
    // });
  }
}

export default new DependencyInjector();
