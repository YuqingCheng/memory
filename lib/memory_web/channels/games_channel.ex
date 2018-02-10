defmodule MemoryWeb.GamesChannel do
  use MemoryWeb, :channel
  use Agent

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      curr_name = :"#{name}"
      try do
        game = Agent.get(curr_name, &(&1))
        socket = assign(socket, "curr_name", curr_name)
        {:ok, %{"state" => game}, socket}
      catch
        exit,_ -> 
          {_, game} = Agent.start(fn -> new_game end, name: curr_name)
          socket = assign(socket, "curr_name", curr_name)
          {:ok, %{"state" => game}, socket}
      end
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def new_game do
    %{letters: new_letters, hide: new_hide, last: nil, count: 0, score: nil}
  end

  def new_letters do
    Enum.shuffle ["A","A","B","B","C","C","D","E","E","D","F","F","G","G","H","H"]
  end

  def new_hide do
    for _ <- 1..16 do
      true
    end
  end

  # encapsulate agent: get current state from agent
  def curr_state(socket)do
    curr_name = socket.assigns["curr_name"]
    Agent.get(curr_name, &(&1))
  end

  # encapsulate agent: update current state in agent
  def update_state(state, socket) do
    curr_name = socket.assigns["curr_name"]
    Agent.update(curr_name, fn last_state -> state end)
  end

  def uncover(list, index) do
    List.replace_at(list, index, false)
  end

  def cover(list, index) do
    List.replace_at(list, index, true)
  end

  def check_win(hide) do 
    if Enum.empty?(hide) do
      true
    else
      [s | rest] = hide
      if s do
        false
      else
        true && check_win(rest)
      end
    end
  end

  # handle guess operation
  def handle_in("guess", %{"index" => i}, socket) do
    state = curr_state(socket)
    state = %{state | :count => state.count+1}
    if state[:last] do
      guess = Enum.at(state[:letters], i)
      answer = Enum.at(state[:letters], state[:last])
      if answer == guess do
        list = uncover(state[:hide], i)
        state = %{state | :hide => list}
      else
        list = cover(state[:hide], state[:last])
        state = %{state | :hide => list}
      end
      state = %{state | :last => nil}
      if check_win(state[:hide]) do
        state = %{state | :score => 116 - state[:count]}
      end
    else
      list = uncover(state[:hide], i)
      state = %{state | :hide => list}
      state = %{state | :last => i}
    end
    _ = update_state(state, socket)

    {:reply, {:ok, %{"state" => curr_state(socket)}}, socket}
  end

  # handle restart operation
  def handle_in("restart", payload, socket) do
    _ = update_state(new_game, socket)
    {:reply, {:ok, %{"state" => curr_state(socket)}}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
