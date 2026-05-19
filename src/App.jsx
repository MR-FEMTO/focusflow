import { useEffect, useState } from 'react';

export default function FocusFlowApp() {
  const [page, setPage] = useState('home');
  const [users, setUsers] = useState(() => {
    if (typeof window === 'undefined') return [];

    const savedUsers = localStorage.getItem('focusflow-users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === 'undefined') return null;

    const savedCurrentUser = localStorage.getItem('focusflow-current-user');
    return savedCurrentUser ? JSON.parse(savedCurrentUser) : null;
  });

  const [signupError, setSignupError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loginError, setLoginError] = useState('');

  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'focusflowadmin123',
  };

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [tasks, setTasks] = useState(() => {
    if (typeof window === 'undefined') return [];

    const savedTasks = localStorage.getItem('focusflow-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [selectedAdminUser, setSelectedAdminUser] = useState(null);

  

  useEffect(() => {
    localStorage.setItem('focusflow-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(
      'focusflow-current-user',
      JSON.stringify(currentUser)
    );
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('focusflow-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('focusflow-page', page);
  }, [page]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setPage('admin-dashboard');
      } else {
        setPage('dashboard');
      }
    }
  }, [currentUser]);

  const [taskForm, setTaskForm] = useState({
    title: '',
    deadline: '',
    file: null,
    proof: null,
  });

  const handleSignup = () => {
    setSignupError('');
    setEmailError('');

    try {
      const cleanUsername = signupData.username.trim().toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!cleanUsername || !signupData.password.trim() || !signupData.email.trim()) {
        setSignupError('Please fill all required fields.');
        return;
      }

      if (!emailRegex.test(signupData.email.trim())) {
        setEmailError(
          'Please enter a valid email address (example@gmail.com).'
        );
        return;
      }

      const existingUser = users.find(
        (u) =>
          u.username.trim().toLowerCase() === cleanUsername
      );

      if (existingUser) {
        setSignupError(
          'This username is already taken. Please enter a different one.'
        );
        return;
      }

      const newUser = {
        username: signupData.username.trim(),
        email: signupData.email.trim(),
        password: signupData.password,
      };

      const updatedUsers = [...users, newUser];

      setUsers(updatedUsers);
      localStorage.setItem(
        'focusflow-users',
        JSON.stringify(updatedUsers)
      );

      setCurrentUser(newUser);

      localStorage.setItem(
        'focusflow-current-user',
        JSON.stringify(newUser)
      );

      setLoginData({
        username: signupData.username,
        password: signupData.password,
      });

      setPage('dashboard');

      setSignupError('');
      alert('Account created successfully!');
    } catch (error) {
      console.error(error);
      setSignupError('Something went wrong during signup.');
    }
  };

  const handleLogin = () => {
    setLoginError('');
    if (!loginData.username || !loginData.password) {
      setLoginError('Please enter username and password.');
      return;
    }

    const foundUserByUsername = users.find(
      (u) =>
        u.username.trim().toLowerCase() ===
        loginData.username.trim().toLowerCase()
    );

    const foundUser = users.find(
      (u) =>
        u.username.trim().toLowerCase() ===
          loginData.username.trim().toLowerCase() &&
        u.password === loginData.password
    );

    if (
      loginData.username === ADMIN_CREDENTIALS.username &&
      loginData.password === ADMIN_CREDENTIALS.password
    ) {
      setCurrentUser({
        username: 'Admin',
        role: 'admin',
      });

      setPage('admin-dashboard');
      alert('Admin login successful!');
      return;
    }

    if (foundUser) {
      setCurrentUser(foundUser);
      setPage('dashboard');
      alert('Login successful!');
    } else {
      if (!foundUserByUsername) {
        setLoginError(
          'This username does not exist. Please create an account first.'
        );
      } else {
        setLoginError('Incorrect password. Please try again.');
      }
    }
  };

  const addTask = () => {
    if (!taskForm.title || !taskForm.deadline) {
      alert('Please enter task title and deadline');
      return;
    }

    const newTask = {
      id: Date.now(),
      title: taskForm.title,
      deadline: taskForm.deadline,
      file: taskForm.file,
      proof: null,
      completed: false,
    };

    setTasks([...tasks, {
      ...newTask,
      owner: currentUser.username,
    }]);

    setTaskForm({
      title: '',
      deadline: '',
      file: null,
      proof: null,
    });

    alert('Task added successfully!');
  };


  const uploadProof = (id, file) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            proof: file,
          };
        }

        return task;
      })
    );
  };

  const markDone = (id) => {
    const selectedTask = tasks.find((task) => task.id === id);

    if (!selectedTask.proof) {
      alert('You must upload proof before completing this task!');
      return;
    }

    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            completed: true,
          };
        }

        return task;
      })
    );

    alert('Task marked as completed!');
  };

  if (page === 'signup') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative">
        <button
          onClick={() => setPage('home')}
          className="absolute top-6 left-6 w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/10 backdrop-blur-xl text-2xl hover:scale-110"
        >
          🏠
        </button>
        <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8">
          <h1 className="text-4xl font-black mb-2">Create Account</h1>
          <p className="text-gray-400 mb-8">
            Start your behavioral productivity journey.
          </p>

          <div className="space-y-4">
            <input
              placeholder="Username"
              value={signupData.username}
              onChange={(e) => {
                setSignupError('');
                setSignupData({
                  ...signupData,
                  username: e.target.value,
                });
              }}
              className={`w-full p-4 rounded-2xl bg-white/10 border outline-none ${
                signupError
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-white/10'
              }`}
            />

            {signupError && (
              <p className="text-red-400 text-sm px-2">
                {signupError}
              </p>
            )}

            <input
              type="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) => {
                setEmailError('');
                setSignupData({
                  ...signupData,
                  email: e.target.value,
                });
              }}
              className={`w-full p-4 rounded-2xl bg-white/10 border outline-none ${
                emailError
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-white/10'
              }`}
            />

            {emailError && (
              <p className="text-red-400 text-sm px-2">
                {emailError}
              </p>
            )}

            <input
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 outline-none"
            />

            <button
              type="button"
              onClick={() => {
                handleSignup();
              }}
              className="w-full py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 transition font-bold"
            >
              Sign Up
            </button>

            <button
              type="button"
              onClick={() => setPage('login')}
              className="w-full text-gray-400 mt-2"
            >
              Already have an account?
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'login') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative">
        <button
          onClick={() => setPage('home')}
          className="absolute top-6 left-6 w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/10 backdrop-blur-xl text-2xl hover:scale-110"
        >
          🏠
        </button>
        <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8">
          <h1 className="text-4xl font-black mb-2">Welcome Back</h1>
          <p className="text-gray-400 mb-8">
            Login to continue your focus journey.
          </p>

          <div className="space-y-4">
            <input
              placeholder="Username"
              value={loginData.username}
              onChange={(e) => {
                setLoginError('');
                setLoginData({
                  ...loginData,
                  username: e.target.value,
                });
              }}
              className={`w-full p-4 rounded-2xl bg-white/10 border outline-none ${
                loginError
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-white/10'
              }`}
            />

            {loginError && (
              <p className="text-red-400 text-sm px-2">
                {loginError}
              </p>
            )}

            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 outline-none"
            />

            <button
              type="button"
              onClick={() => {
                handleLogin();
              }}
              className="w-full py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 transition font-bold"
            >
              Login
            </button>

            <button
              onClick={() => setPage('signup')}
              className="w-full text-gray-400 mt-2"
            >
              Create New Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'admin-dashboard') {
    if (selectedAdminUser) {
      const selectedUserTasks = tasks.filter(
        (task) => task.owner === selectedAdminUser.username
      );

      const completedTasks = selectedUserTasks.filter(
        (task) => task.completed
      ).length;

      const pendingTasks = selectedUserTasks.filter(
        (task) => !task.completed
      ).length;

      return (
        <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />

          <button
            onClick={() => setSelectedAdminUser(null)}
            className="mb-10 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/10"
          >
            ← Back to Users
          </button>

          <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-2xl mb-10">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div>
                <h1 className="text-6xl font-black mb-3">
                  {selectedAdminUser.username}
                </h1>

                <p className="text-gray-400 text-xl">
                  {selectedAdminUser.email}
                </p>
              </div>

              <div className="flex gap-4 flex-wrap">
                <div className="px-6 py-4 rounded-3xl bg-green-500/20 text-green-300 text-lg font-bold">
                  Completed: {completedTasks}
                </div>

                <div className="px-6 py-4 rounded-3xl bg-yellow-500/20 text-yellow-300 text-lg font-bold">
                  Pending: {pendingTasks}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {selectedUserTasks.length > 0 ? (
              selectedUserTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white/5 border border-white/10 rounded-[32px] p-8 hover:bg-white/[0.07] transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-6 flex-wrap">
                    <div>
                      <h2 className="text-3xl font-black mb-3">
                        {task.title}
                      </h2>

                      <p className="text-gray-400 text-lg mb-4">
                        Deadline: {task.deadline}
                      </p>

                      {task.file && (
                        <div className="mb-3 text-blue-400">
                          📎 Attached File: {task.file.name}
                        </div>
                      )}

                      {task.proof ? (
                        <div className="text-green-400">
                          ✓ Proof Uploaded: {task.proof.name}
                        </div>
                      ) : (
                        <div className="text-red-400">
                          ✕ No proof uploaded yet
                        </div>
                      )}
                    </div>

                    <div>
                      {task.completed ? (
                        <div className="px-6 py-4 rounded-3xl bg-green-500/20 text-green-300 font-bold text-lg">
                          Completed ✓
                        </div>
                      ) : (
                        <div className="px-6 py-4 rounded-3xl bg-yellow-500/20 text-yellow-300 font-bold text-lg">
                          In Progress
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 text-2xl py-20">
                This user has no tasks yet.
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />

        <div className="relative z-10 flex items-center justify-between mb-16 flex-wrap gap-6">
          <div>
            <h1 className="text-7xl font-black mb-4">
              Admin Dashboard
            </h1>

            <p className="text-gray-400 text-2xl max-w-3xl">
              Monitor all students, track productivity, and analyze behavioral progress.
            </p>
          </div>

          <button
            onClick={() => {
              setCurrentUser(null);
              localStorage.removeItem('focusflow-current-user');
              setPage('home');
            }}
            className="px-7 py-4 rounded-3xl bg-red-500/20 hover:bg-red-500/30 transition-all duration-300 text-red-300 font-medium"
          >
            Logout
          </button>
        </div>

        <div className="relative z-10 grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {users.map((user, index) => {
            const userTasks = tasks.filter(
              (task) => task.owner === user.username
            );

            const completedTasks = userTasks.filter(
              (task) => task.completed
            ).length;

            return (
              <div
                key={index}
                onClick={() => setSelectedAdminUser(user)}
                className="group cursor-pointer bg-white/5 border border-white/10 rounded-[36px] p-8 hover:bg-gradient-to-b hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-500 hover:-translate-y-3 backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-black shadow-2xl shadow-blue-500/30">
                    {user.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="text-blue-400 text-3xl group-hover:translate-x-2 transition-transform duration-300">
                    →
                  </div>
                </div>

                <h2 className="text-4xl font-black mb-3 break-words">
                  {user.username}
                </h2>

                <p className="text-gray-400 mb-8 break-words">
                  {user.email}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">
                      Completed Tasks
                    </p>

                    <h3 className="text-3xl font-black text-green-400">
                      {completedTasks}
                    </h3>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    👤
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (page === 'dashboard') {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-5xl font-black">
              Welcome, {currentUser.username}
            </h1>
            <p className="text-gray-400 mt-2">
              Track your deadlines and fight procrastination.
            </p>
          </div>

          <button
            onClick={() => {
              setCurrentUser(null);
              localStorage.removeItem('focusflow-current-user');
              setPage('home');
            }}
            className="px-6 py-3 rounded-2xl bg-red-500/20 text-red-300"
          >
            Logout
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6">New Task</h2>

            <div className="space-y-4">
              <input
                placeholder="Task Title"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
                className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 outline-none"
              />

              <input
                type="datetime-local"
                value={taskForm.deadline}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, deadline: e.target.value })
                }
                className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 outline-none"
              />

              <label className="block p-4 rounded-2xl bg-white/10 border border-white/10 cursor-pointer hover:bg-white/20 transition text-gray-300 text-sm">
                Upload Assignment / Lecture / Task File
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setTaskForm({
                        ...taskForm,
                        file: e.target.files[0],
                      });
                    }
                  }}
                />

                {taskForm.file && (
                  <p className="text-green-400 mt-2">
                    Uploaded: {taskForm.file.name}
                  </p>
                )}
              </label>

              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-blue-300 text-sm">
                You can upload your assignment, lecture, or any related file here.
                Proof upload will still be required before marking the task as done.
              </div>

              <button
                onClick={addTask}
                className="w-full py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 transition font-bold"
              >
                Add Task
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6">Your Tasks</h2>

            <div className="space-y-4 max-h-[600px] overflow-auto pr-2">
              {tasks
                .filter((task) => task.owner === currentUser.username)
                .map((task) => (
                <div
                  key={task.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold">{task.title}</h3>
                      <p className="text-gray-400 mt-2">
                        Deadline: {task.deadline}
                      </p>

                      {task.file && (
                        <p className="text-blue-400 mt-2 text-sm">
                          Attached File: {task.file.name}
                        </p>
                      )}

                      {task.proof ? (
                        <p className="text-green-400 mt-2 text-sm">
                          Proof Uploaded: {task.proof.name}
                        </p>
                      ) : (
                        <p className="text-red-400 mt-2 text-sm">
                          No proof uploaded yet
                        </p>
                      )}
                    </div>

                    {task.completed ? (
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-2xl">
                        ✓
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 items-end">
                        <label className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-sm">
                          Upload Proof
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                uploadProof(task.id, e.target.files[0]);
                              }
                            }}
                          />
                        </label>

                        <button
                          onClick={() => markDone(task.id)}
                          className={`px-5 py-3 rounded-2xl transition font-medium ${
                            task.proof
                              ? 'bg-blue-500 hover:bg-blue-400'
                              : 'bg-gray-700 cursor-not-allowed opacity-60'
                          }`}
                        >
                          Mark Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-blue-500/20 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/20 blur-[120px] rounded-full animate-pulse" />
      </div>

      <nav className="relative z-20 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-2xl bg-black/20 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl shadow-2xl shadow-blue-500/30">
            ⚡
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight">
              FocusFlow
            </h1>
            <p className="text-sm text-gray-400">
              Behavioral Engineering Platform
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setPage('login')}
            className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-xl border border-white/10 hover:scale-105"
          >
            Login
          </button>

          <button
            onClick={() => setPage('signup')}
            className="px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 transition-all duration-300 font-medium shadow-2xl shadow-blue-500/30 hover:scale-105"
          >
            Sign Up
          </button>
        </div>
      </nav>

      <section className="relative z-10 min-h-screen flex items-center px-8 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 mb-8 backdrop-blur-xl animate-pulse">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              AI Behavioral Productivity System
            </div>

            <h1 className="text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-8">
              The problem
              <br />
              isn’t your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400">
                time.
              </span>
            </h1>

            <p className="text-2xl text-gray-300 leading-relaxed max-w-2xl mb-12">
              FocusFlow transforms procrastination into execution using
              behavioral engineering, accountability systems, and intelligent
              productivity tracking.
            </p>

            <div className="flex flex-wrap gap-5 mb-14">
              <button
                onClick={() => setPage('signup')}
                className="px-10 py-5 rounded-3xl bg-blue-500 hover:bg-blue-400 transition-all duration-300 text-xl font-bold shadow-[0_0_60px_rgba(59,130,246,0.5)] hover:scale-105"
              >
                Start Free →
              </button>

              <button className="px-10 py-5 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 text-xl backdrop-blur-xl hover:scale-105">
                Watch Demo
              </button>
            </div>

            <div className="flex flex-wrap gap-8 text-gray-400 text-lg">
              <div>
                <span className="text-white font-bold text-2xl">10K+</span>
                <br />
                Tasks Managed
              </div>

              <div>
                <span className="text-white font-bold text-2xl">92%</span>
                <br />
                Productivity Increase
              </div>

              <div>
                <span className="text-white font-bold text-2xl">24/7</span>
                <br />
                Accountability
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 bg-blue-500/20 blur-[100px] rounded-full" />

            <div className="relative bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black">
                    Live Productivity Dashboard
                  </h2>
                  <p className="text-gray-400 mt-2">
                    Real-time behavioral tracking
                  </p>
                </div>

                <div className="px-5 py-3 rounded-2xl bg-green-500/20 text-green-300 font-medium animate-pulse">
                  ● Active
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="bg-black/30 border border-white/10 rounded-3xl p-6 hover:scale-105 transition-all duration-300">
                  <p className="text-gray-400 mb-2">Focus Score</p>
                  <h3 className="text-5xl font-black text-blue-400">87%</h3>
                </div>

                <div className="bg-black/30 border border-white/10 rounded-3xl p-6 hover:scale-105 transition-all duration-300">
                  <p className="text-gray-400 mb-2">Streak</p>
                  <h3 className="text-5xl font-black text-purple-400">14🔥</h3>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  {
                    title: 'Physics Assignment',
                    status: 'In Progress',
                    color: 'yellow',
                  },
                  {
                    title: 'Behavioral Research',
                    status: 'Completed',
                    color: 'green',
                  },
                  {
                    title: 'Calculus Revision',
                    status: 'Pending',
                    color: 'red',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-black/20 border border-white/10 rounded-2xl p-5 hover:bg-white/5 transition-all duration-300"
                  >
                    <div>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Deadline approaching
                      </p>
                    </div>

                    <div
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        item.color === 'green'
                          ? 'bg-green-500/20 text-green-300'
                          : item.color === 'yellow'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-6">
                <h3 className="text-2xl font-bold mb-3">
                  Behavioral Insight
                </h3>

                <p className="text-gray-300 leading-relaxed">
                  You are most productive between 7PM and 10PM.
                  Your procrastination rate decreased by 34% this week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black mb-6">
              Why FocusFlow?
            </h2>

            <p className="text-gray-400 text-2xl max-w-4xl mx-auto leading-relaxed">
              More than a to-do list.
              A complete behavioral transformation system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '🧠',
                title: 'Behavior Tracking',
                desc: 'Analyze procrastination and focus patterns.',
              },
              {
                icon: '📅',
                title: 'Smart Scheduling',
                desc: 'Manage lectures, tasks, and deadlines easily.',
              },
              {
                icon: '⚡',
                title: 'Focus Mode',
                desc: 'Reduce distractions with deep work sessions.',
              },
              {
                icon: '👨‍🏫',
                title: 'Admin Monitoring',
                desc: 'Track progress and accountability in real time.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 border border-white/10 rounded-[32px] p-8 hover:bg-gradient-to-b hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-500 hover:-translate-y-3 backdrop-blur-xl"
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                <h3 className="text-3xl font-black mb-4">
                  {feature.title}
                </h3>

                <p className="text-gray-400 text-lg leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
