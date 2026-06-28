import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./components/MapPanel", () => ({
  MapPanel: () => <div data-testid="map-panel" />,
}));

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe("App", () => {
  it("renders a destination-first discovery map", async () => {
    renderApp();

    expect(await screen.findByText("Vlog Map")).toBeInTheDocument();
    expect(screen.getByTestId("map-panel")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Himachal", level: 1 })).toBeInTheDocument();
    expect(await screen.findByText("Jana Waterfall")).toBeInTheDocument();
  });
});
