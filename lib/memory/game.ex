defmodule Memory.Game do
  use Agent

  def new_game do
    %{letters: new_letters, hide: new_hide, last: nil, count: 0, score: nil}
  end

  def join_game(curr_name) do
    try do
      Agent.get(curr_name, &(&1))
    catch
      exit,_ -> 
        {_, game} = Agent.start(fn -> new_game end, name: curr_name)
        game
    end
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
  def curr_state(curr_name) do
    Agent.get(curr_name, &(&1))
  end

  # encapsulate agent: update current state in agent
  def update_state(state, curr_name) do
    Agent.update(curr_name, fn last_state -> state end)
  end

  def delete_state(curr_name) do
    Agent.stop(curr_name, :normal, :infinity)
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

  def handle_guess(i, curr_name) do
    state = curr_state(curr_name)
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
    _ = update_state(state, curr_name)
    curr_state(curr_name)
  end


end