<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProposalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Proposal::with(['professor', 'department', 'area']);

        if ($request->has('area_id')) {
            $query->where('area_id', $request->area_id);
        }

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->isProfessor()) {
            return response()->json(['message' => 'Apenas professores podem criar propostas.'], 403);
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'prerequisites' => 'nullable|string',
            'max_slots' => 'required|integer|min:1',
            'department_id' => 'nullable|exists:departments,id',
            'area_id' => 'nullable|exists:knowledge_areas,id',
        ]);

        $data['professor_id'] = $request->user()->id;

        $proposal = Proposal::create($data);

        return response()->json($proposal->load(['professor', 'department', 'area']), 201);
    }

    public function show(Proposal $proposal): JsonResponse
    {
        return response()->json($proposal->load(['professor', 'department', 'area']));
    }

    public function update(Request $request, Proposal $proposal): JsonResponse
    {
        if ($request->user()->id !== $proposal->professor_id) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'prerequisites' => 'nullable|string',
            'max_slots' => 'sometimes|integer|min:1',
            'department_id' => 'nullable|exists:departments,id',
            'area_id' => 'nullable|exists:knowledge_areas,id',
            'status' => 'sometimes|in:open,closed',
        ]);

        $proposal->update($data);

        return response()->json($proposal->load(['professor', 'department', 'area']));
    }

    public function destroy(Request $request, Proposal $proposal): JsonResponse
    {
        if ($request->user()->id !== $proposal->professor_id) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        $proposal->delete();

        return response()->json(null, 204);
    }
}
