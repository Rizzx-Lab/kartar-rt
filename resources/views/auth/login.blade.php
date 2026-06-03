<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Karang Taruna Armalo Eluf</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        navy: { 50:'#EEF2FF', 700:'#1F2E76', 800:'#1B2B6B', 900:'#111D4A' },
                        gold: { 400:'#D4B05A', 500:'#C9A84C' }
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-navy-900 min-h-screen flex items-center justify-center p-4">

    <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(circle, #C9A84C 1px, transparent 1px); background-size: 40px 40px;"></div>
    <div class="absolute top-20 left-20 w-72 h-72 bg-gold-500 opacity-5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-20 right-20 w-96 h-96 bg-navy-700 opacity-20 rounded-full blur-3xl"></div>

    <div class="relative w-full max-w-md">
        <!-- Card -->
        <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <!-- Header -->
            <div class="bg-navy-800 px-8 py-10 text-center relative overflow-hidden">
                <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle, #C9A84C 1px, transparent 1px); background-size: 30px 30px;"></div>
                <div class="relative">
                    <div class="w-16 h-16 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span class="text-navy-900 font-bold text-xl">AE</span>
                    </div>
                    <h1 class="text-white font-bold text-xl">Karang Taruna</h1>
                    <p class="text-gold-400 text-sm mt-1">Armalo Eluf — Panel Admin</p>
                </div>
            </div>

            <!-- Form -->
            <div class="px-8 py-8">
                <h2 class="text-navy-800 font-bold text-lg mb-1">Masuk ke Dashboard</h2>
                <p class="text-gray-400 text-sm mb-6">Silakan login dengan akun admin kamu</p>

                @if($errors->any())
                    <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
                        <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        {{ $errors->first() }}
                    </div>
                @endif

                <form method="POST" action="{{ route('login') }}" class="space-y-4">
                    @csrf
                    <div>
                        <label class="block text-sm font-semibold text-navy-800 mb-1.5">Email</label>
                        <input type="email" name="email" value="{{ old('email') }}" required
                            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                            placeholder="email@example.com">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-navy-800 mb-1.5">Password</label>
                        <input type="password" name="password" required
                            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                            placeholder="••••••••">
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" name="remember" id="remember" class="w-4 h-4 text-navy-700 rounded">
                        <label for="remember" class="text-sm text-gray-500">Ingat saya</label>
                    </div>
                    <button type="submit"
                        class="w-full bg-navy-800 text-white py-3.5 rounded-xl font-semibold hover:bg-navy-700 transition-all duration-300 mt-2">
                        Masuk
                    </button>
                </form>

                <div class="text-center mt-6">
                    <a href="{{ route('home') }}" class="text-sm text-gray-400 hover:text-navy-700 transition-colors">
                        ← Kembali ke Website
                    </a>
                </div>
            </div>
        </div>
    </div>

</body>
</html>