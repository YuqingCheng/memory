defmodule MemoryWeb.GamesChannel do
  use MemoryWeb, :channel
  alias Memory.Game

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      curr_name = :"#{name}"
      game = Game.join_game(curr_name)
      socket = assign(socket, "curr_name", curr_name)
      {:ok, %{"state" => game}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # handle guess operation
  def handle_in("guess", %{"index" => i}, socket) do
    curr_name = socket.assigns["curr_name"]
    curr_state = Game.handle_guess(i, curr_name)
    {:reply, {:ok, %{"state" => curr_state}}, socket}
  end

  # handle restart operation
  def handle_in("restart", payload, socket) do
    curr_name = socket.assigns["curr_name"]
    _ = Game.delete_state(curr_name)
    {:reply, {:ok, %{}}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
