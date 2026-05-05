<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApplyProposalRequest;
use App\Http\Requests\ApproveApplicationRequest;
use App\Http\Requests\RejectApplicationRequest;
use App\Models\Application;
use App\Models\Proposal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    /**
     * @param ApplyProposalRequest $request
     * @param Proposal $proposal
     * @return JsonResponse
     */
    public function apply(ApplyProposalRequest $request, Proposal $proposal): JsonResponse
    {
        if ($proposal->status === 'closed') {
            return response()->json(['message' => 'Esta proposta está fechada.'], 422);
        }

        if (!$proposal->hasAvailableSlots()) {
            return response()->json(['message' => 'Não há vagas disponíveis.'], 422);
        }

        $existing = Application::where('student_id', $request->user()->id)
            ->where('proposal_id', $proposal->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Você já se candidatou a esta proposta.'], 422);
        }

        $application = Application::create([
            'student_id' => $request->user()->id,
            'proposal_id' => $proposal->id,
            'status' => 'pending',
            'applied_at' => now(),
        ]);

        return response()->json($application->load(['student', 'proposal']), 201);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
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

    /**
     * @param Request $request
     * @param Application $application
     * @return JsonResponse
     */
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

    /**
     * @param ApproveApplicationRequest $request
     * @param Application $application
     * @return JsonResponse
     */
    public function approve(ApproveApplicationRequest $request, Application $application): JsonResponse
    {
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

    /**
     * @param RejectApplicationRequest $request
     * @param Application $application
     * @return JsonResponse
     */
    public function reject(RejectApplicationRequest $request, Application $application): JsonResponse
    {
        $application->update([
            'status' => 'rejected',
            'feedback' => $request->validated()['feedback'] ?? null,
            'reviewed_at' => now(),
        ]);

        return response()->json($application->load(['student', 'proposal']));
    }
}
