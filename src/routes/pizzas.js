const express = require("express");
const Pizza = require("../models/Pizza");

const router = express.Router();

// Obtener todas las pizzas
router.get("/", async (req, res) => {
  try {
    const pizzas = await Pizza.find();
    res.json(pizzas);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo las pizzas" });
  }
});

// Agregar una nueva pizza
router.post("/", async (req, res) => {
  try {
    const nuevaPizza = new Pizza(req.body);
    await nuevaPizza.save();
    res.status(201).json(nuevaPizza);
  } catch (error) {
    res.status(500).json({ message: "Error al agregar la pizza" });
  }
});

// Eliminar una pizza
router.delete("/:id", async (req, res) => {
  try {
    await Pizza.findByIdAndDelete(req.params.id);
    res.json({ message: "Pizza eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la pizza" });
  }
});

module.exports = router;
