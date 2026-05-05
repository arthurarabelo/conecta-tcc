<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Proposal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function apply(Request $request, Proposal $proposal): JsonResponse
    {
        $user = $request->user();

        if (!$user->isStudent()) {
            return response()->json(['message' => 'Apenas alunos podem se candidatar.'], 403);
        }

        if ($proposal->status === 'closed') {
            return response()->json(['message' => 'Esta proposta está fechada.'], 422);
        }

        if (!$proposal->hasAvailableSlots()) {
            return response()->json(['message' => 'Não há vagas disponíveis.'], 422);
        }

        $existing = Application::where('student_id', $user->id)
            ->where('proposal_id', $proposal->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Você já se candidatou a esta proposta.'], 422);
        }

        $application = Application::create([
            'student_id' => $user->id,
            'proposal_id' => $proposal->id,
            'status' => 'pending',
            'applied_at' => now(),
        ]);

        return response()->json($application->load(['student', 'proposal']), 201);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Application::with(['student', 'proposal']);

        if ($user->isStudent()) {
            $query->where('student_id', $user->id);
        } else {
            $query->whereHas('proposal', fn ($q) => $q->where('professor_id', $user->id));
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(15));
    }

    public function show(Request $request, Application $application): JsonResponse
    {
        $user = $request->user();

        $isStudent = $user->isStudent() && $application->student_id === $user->id;
        $isProfessor = $user->isProfessor() && $application->proposal->professor_id === $user->id;

        if (!$isStudent && !$isProfessor) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        return response()->json($application->load(['student', 'proposal']));
    }

    public function approve(Request $request, Application $application): JsonResponse
    {
        $user = $request->user();

        if ($application->proposal->professor_id !== $user->id) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        if (!$application->proposal->hasAvailableSlots()) {
            return response()->json(['message' => 'Não há vagas disponíveis.'], 422);
        }

        $application->update([
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);

        if (!$application->proposal->hasAvailableSlots()) {
            $application->proposal->update(['status' => 'closed']);
        }

        return response()->json($application->load(['student', 'proposal']));
    }

    public function reject(Request $request, Application $application): JsonResponse
    {
        $user = $request->user();

        if ($application->proposal->professor_id !== $user->id) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        $data = $request->validate([
            'feedback' => 'nullable|string',
        ]);

        $application->update([
            'status' => 'rejected',
            'feedback' => $data['feedback'] ?? null,
            'reviewed_at' => now(),
        ]);

        return response()->json($application->load(['student', 'proposal']));
    }
}
