<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProposalRequest;
use App\Http\Requests\UpdateProposalRequest;
use App\Models\Proposal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProposalController extends Controller
{
    /**
     * @param Request $request
     * @return JsonResponse
     */
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

    /**
     * @param StoreProposalRequest $request
     * @return JsonResponse
     */
    public function store(StoreProposalRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['professor_id'] = $request->user()->id;

        $proposal = Proposal::create($data);

        return response()->json($proposal->load(['professor', 'department', 'area']), 201);
    }

    /**
     * @param Proposal $proposal
     * @return JsonResponse
     */
    public function show(Proposal $proposal): JsonResponse
    {
        return response()->json($proposal->load(['professor', 'department', 'area']));
    }

    /**
     * @param UpdateProposalRequest $request
     * @param Proposal $proposal
     * @return JsonResponse
     */
    public function update(UpdateProposalRequest $request, Proposal $proposal): JsonResponse
    {
        $proposal->update($request->validated());

        return response()->json($proposal->load(['professor', 'department', 'area']));
    }

    /**
     * @param Request $request
     * @param Proposal $proposal
     * @return JsonResponse
     */
    public function destroy(Request $request, Proposal $proposal): JsonResponse
    {
        if ($request->user()->id !== $proposal->professor_id) {
            return response()->json(['message' => 'Sem permissão.'], 403);
        }

        $proposal->delete();

        return response()->json(null, 204);
    }
}
