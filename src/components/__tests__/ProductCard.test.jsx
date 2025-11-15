import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import ProductCard from "../ProductCard";

// Wrapper pour Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// Données de test
const mockProduct = {
  id: "1",
  name: "Poulets de chair",
  description: "Poulets de chair frais et de qualité",
  price: 25000,
  stock: 50,
  category: "poulets",
  image: "https://example.com/chicken.jpg",
  producer: {
    firstName: "John",
    lastName: "Doe",
  },
};

describe("ProductCard", () => {
  test("affiche les informations du produit correctement", () => {
    const mockOnAddToCart = vi.fn();

    renderWithRouter(
      <ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />
    );

    // Vérifier que le nom du produit est affiché
    expect(screen.getByText("Poulets de chair")).toBeInTheDocument();

    // Vérifier que la description est affichée
    expect(
      screen.getByText("Poulets de chair frais et de qualité")
    ).toBeInTheDocument();

    // Vérifier que le prix est affiché
    expect(screen.getByText("25,000 GNF")).toBeInTheDocument();

    // Vérifier que la catégorie est affichée
    expect(screen.getByText("poulets")).toBeInTheDocument();

    // Vérifier que le producteur est affiché
    expect(screen.getByText("Par: John Doe")).toBeInTheDocument();

    // Vérifier que le statut du stock est affiché
    expect(screen.getByText("En stock")).toBeInTheDocument();
  });

  test('affiche "Rupture" quand le stock est à 0', () => {
    const productOutOfStock = { ...mockProduct, stock: 0 };
    const mockOnAddToCart = vi.fn();

    renderWithRouter(
      <ProductCard product={productOutOfStock} onAddToCart={mockOnAddToCart} />
    );

    expect(screen.getByText("Rupture")).toBeInTheDocument();
  });

  test("appelle onAddToCart quand le bouton est cliqué", () => {
    const mockOnAddToCart = vi.fn();

    renderWithRouter(
      <ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />
    );

    const addToCartButton = screen.getByTitle("Ajouter au panier");
    fireEvent.click(addToCartButton);

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  test("désactive le bouton d'ajout au panier quand le stock est à 0", () => {
    const productOutOfStock = { ...mockProduct, stock: 0 };
    const mockOnAddToCart = vi.fn();

    renderWithRouter(
      <ProductCard product={productOutOfStock} onAddToCart={mockOnAddToCart} />
    );

    const addToCartButton = screen.getByTitle("Produit en rupture de stock");
    expect(addToCartButton).toBeDisabled();
  });

  test("affiche une image par défaut quand aucune image n'est fournie", () => {
    const productWithoutImage = { ...mockProduct, image: null };
    const mockOnAddToCart = vi.fn();

    renderWithRouter(
      <ProductCard
        product={productWithoutImage}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText("Aucune image")).toBeInTheDocument();
  });

  test("n'affiche pas les actions quand showActions est false", () => {
    const mockOnAddToCart = vi.fn();

    renderWithRouter(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        showActions={false}
      />
    );

    // Vérifier que les boutons d'action ne sont pas présents
    expect(screen.queryByText("Voir détails")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Ajouter au panier")).not.toBeInTheDocument();
  });
});

