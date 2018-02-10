defmodule MemoryWeb.GamesChannel do
  use MemoryWeb, :channel
  use Agent

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      curr_name = :"#{name}"
      try do
        game = Agent.get(curr_name, &(&1))
        socket = assign(socket, "curr_name", curr_name)
        {:ok, %{"join" => game}, socket}
      catch
        exit,_ -> 
          Agent.start(fn -> new_game end, name: curr_name)
          game = Agent.get(name, &(&1))
          socket = assign(socket, "curr_name", curr_name)
          {:ok, %{"join" => game}, socket}
      end
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def new_game do
    %{:letters => new_letters, :hide => new_hide, :last => nil}
  end

  def new_letters do
    Enum.shuffle ['A','A','B','B','C','C','D','D','E','E','F','F','G','G','H','H']
  end

  def new_hide do
    for _ <- 1..16 do
      true
    end
  end

  def curr_state do
    curr_name = socket.assigns["curr_name"]
    Agent.get(curr_name, &(&1))
  end

  def update_state(state) do
    curr_name = socket.assigns["curr_name"]
    Agent.update(curr_name, fn last_state -> state end)
  end

  def uncover(list, index) do
    List.replace_at(list, index, false)
  end

  def cover(list, index) do
    List.replace_at(list, index, true)
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("guess", %{"index" => i, "guess" => guess}, socket) do
    state = curr_state
    if state[:last] do
      answer = Enum.at(state[:letters], i)
      if answer == guess do
        list = uncover(state[:hide], i)
        %{state | :hide => list}
      else
        list = cover(state[:hide], state[:last])
        %{state | :hide => list}
      end
      %{state | :last => nil}
    else
      list = uncover(state[:hide], i)
      %{state | :hide => list}
      %{state | :last => i}
    end
    update_state(state)

    {:reply, {:ok, curr_state}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (games:lobby).
  def handle_in("restart", payload, socket) do
    update_state(new_game)
    {:reply, {:ok, curr_state}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
